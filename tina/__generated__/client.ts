import { createClient } from "tinacms/dist/client";
import { queries } from "./types.js";
export const client = createClient({ url: 'http://localhost:4001/graphql', token: '9a2aa5953a0bdca49f3071d25516e19ba5fcab02', queries,  });
export default client;
  