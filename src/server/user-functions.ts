import { createServerFn } from '@tanstack/react-start'
import { env } from 'cloudflare:workers'
// @ts-ignore
import { context } from 'cloudflare:workers'
import { getAuth, getEmailPromise } from '@/lib/auth'
import { getRequestHeaders } from '@tanstack/react-start/server'

export const listUsersFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { params: any }) => data)
  .handler(async ({ data }) => {
    const { params } = data
    const auth = getAuth(env, context)
    const headers = await getRequestHeaders()
    
    const response = await auth.api.listUsers({
        query: {
            limit: params.pagination.perPage,
            offset: (params.pagination.page - 1) * params.pagination.perPage,
            sortBy: params.sort.field,
            sortDirection: params.sort.order.toLowerCase(),
        },
        headers
    })

    return {
      data: response.users,
      total: response.total,
    }
  })

export const createUserFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { params: any }) => data)
  .handler(async ({ data }) => {
    const { params } = data
    const auth = getAuth(env, context)
    
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
            headers: await getRequestHeaders()
        })

        const createdUser = (response as any).user || (response as any).newUser || response;
        
        if (createdUser && createdUser.email) {
            try {
                await auth.api.sendVerificationEmail({
                    body: {
                        email: createdUser.email,
                        callbackURL: env.BETTER_AUTH_URL,
                    }
                });

                const emailPromise = getEmailPromise();
                if (emailPromise) {
                    await emailPromise;
                }
            } catch (vError: any) {
                console.error("Error al procesar verificación:", vError?.message);
            }
        }

        return {
            data: createdUser
        }
    } catch (error: any) {
        const errorMessage = error.message || String(error);
        
        if (error.code === 'USER_ALREADY_EXISTS') {
            return {
                error: 'User already exists. Use another username or email.'
            }
        }

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
