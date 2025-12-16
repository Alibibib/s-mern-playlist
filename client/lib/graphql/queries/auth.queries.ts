import { gql } from '@apollo/client';

export const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      email
      firstName
      lastName
      createdAt
      updatedAt
    }
  }
`;
