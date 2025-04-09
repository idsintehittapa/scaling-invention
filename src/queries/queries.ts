import { gql } from "@apollo/client";

export const GET_INCIDENTS = gql`
  query GetAllViolentCrimes {
    violent_crimes {
      id
      incident_date
      incident_type
    }
  }
`;
