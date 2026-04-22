import { tanStackRouterProvider } from 'ra-router-tanstack'
import { Admin, ListGuesser, ShowGuesser, LoginPage } from '@/components/admin'
import { Resource } from 'ra-core'
import { dataProvider } from '@/providers/d1DataProvider'
import { authProvider } from '@/providers/authProvider'
import { TodoCreate, TodoEdit } from './Todo'
import { UserList, UserCreate } from './User'

export function App() {
  return (
    //@ts-ignore
    <Admin routerProvider={tanStackRouterProvider} dataProvider={dataProvider} authProvider={authProvider} loginPage={LoginPage}>
      <Resource name="todos" list={ListGuesser} show={ShowGuesser} create={TodoCreate} edit={TodoEdit} />
      {(permissions) => (
        <>
          {permissions === 'admin' ? (
            <Resource name="users" list={UserList} create={UserCreate} />
          ) : null}
        </>
      )}
    </Admin>
  );
}
