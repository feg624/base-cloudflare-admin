import { createServerFn } from '@tanstack/react-start'
import { env } from 'cloudflare:workers'
import { getAuth } from '@/lib/auth'
import { getRequestHeaders } from '@tanstack/react-start/server'

export const listUsersFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { params: any }) => data)
  .handler(async ({ data }) => {
    const { params } = data
    const auth = getAuth(env)
    const headers = await getRequestHeaders()
    
    // Better-Auth admin plugin listUsers
    const response = await auth.api.listUsers({
        query: {
            limit: params.pagination.perPage,
            offset: (params.pagination.page - 1) * params.pagination.perPage,
            sortBy: params.sort.field,
            sortDirection: params.sort.order.toLowerCase(),
        },
        headers
    })

    // Better-Auth listUsers returns { users: User[], total: number }
    return {
      data: response.users,
      total: response.total,
    }
  })

export const createUserFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { params: any }) => data)
  .handler(async ({ data }) => {
    const { params } = data
    const auth = getAuth(env)
    const headers = await getRequestHeaders()
    
    try {
        const response = await auth.api.createUser({
            body: {
                email: params.data.email,
                password: params.data.password,
                name: params.data.name,
                role: params.data.role || 'user',
                username: params.data.username,
                data: {
                    username: params.data.username,
                }
            },
            headers
        })

        // Most Better-Auth server-side API calls return the object directly or { user: ... }
        // If it follows the pattern { user: ... } or { newUser: ... }
        const createdUser = (response as any).user || (response as any).newUser || response
        
        return {
            data: createdUser
        }
    } catch (error: any) {
        const errorMessage = error.message || String(error);
        
        // Handle Better-Auth error codes
        if (error.code === 'USER_ALREADY_EXISTS') {
            return {
                error: 'User already exists. Use another username or email.'
            }
        }

        // Handle raw Database errors (SQLite / D1)
        if (errorMessage.toLowerCase().includes('unique constraint') || 
            errorMessage.toLowerCase().includes('already exists') ||
            errorMessage.toLowerCase().includes('failed query')) {
            
            if (errorMessage.toLowerCase().includes('username')) {
                throw new Error('User already exists. Use another username.');
            }
            if (errorMessage.toLowerCase().includes('email')) {
                throw new Error('Email already registered. Use another email.');
            }
            throw new Error('User already exists. Use another username or email.');
        }

        throw error;
    }
  })
