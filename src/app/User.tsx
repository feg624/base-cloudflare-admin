import { List, DataTable, EmailField, Create, SimpleForm, TextInput, SelectInput } from '@/components/admin'
import { required, email } from 'ra-core'

export const UserList = () => (
  <List sort={{ field: 'username', order: 'ASC' }}>
    <DataTable>
      <DataTable.Col source="username" />
      <DataTable.Col source="name" />
      <DataTable.Col source="email" field={EmailField} />
      <DataTable.Col source="role" />
    </DataTable>
  </List>
)

const validateUsername = [
  required(),
  (value: string) => value && /\s/.test(value) ? 'Username cannot contain spaces' : undefined
];

const validateEmail = [required(), email()];

export const UserCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="username" validate={validateUsername} />
      <TextInput source="name" validate={required()} />
      <TextInput source="email" validate={validateEmail} />
      <TextInput source="password" type="password" validate={required()} />
      <SelectInput
        source="role"
        defaultValue="user"
        choices={[
          { id: 'admin', name: 'Admin' },
          { id: 'user', name: 'User' },
        ]}
      />
    </SimpleForm>
  </Create>
)
