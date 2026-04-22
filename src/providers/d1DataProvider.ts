import { getListFn, getOneFn, getManyFn, getManyReferenceFn, createFn, updateFn, updateManyFn, deleteFn, deleteManyFn } from '@/server/db-functions'
import { listUsersFn, createUserFn } from '@/server/user-functions'

export const dataProvider = {
  getList: async (resource: string, params: any) => {
    if (resource === 'users') {
      const result = await listUsersFn({ data: { params } })
      return result
    }
    const result = await getListFn({ data: { resource, params } })
    return result
  },

  getOne: async (resource: string, params: any) => {
    const result = await getOneFn({ data: { resource, params } })
    return result
  },

  getMany: async (resource: string, params: any) => {
    const result = await getManyFn({ data: { resource, params } })
    return result
  },

  getManyReference: async (resource: string, params: any) => {
    const result = await getManyReferenceFn({ data: { resource, params } })
    return result
  },

  create: async (resource: string, params: any) => {
    if (resource === 'users') {
      const result = await createUserFn({ data: { params } })
      return result
    }
    const result = await createFn({ data: { resource, params } })
    return result
  },

  update: async (resource: string, params: any) => {
    const result = await updateFn({ data: { resource, params } })
    return result
  },

  updateMany: async (resource: string, params: any) => {
    const result = await updateManyFn({ data: { resource, params } })
    return result
  },

  delete: async (resource: string, params: any) => {
    const result = await deleteFn({ data: { resource, params } })
    return result
  },

  deleteMany: async (resource: string, params: any) => {
    const result = await deleteManyFn({ data: { resource, params } })
    return result
  },

}
