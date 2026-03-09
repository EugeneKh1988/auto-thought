import { db as db_server } from './database.server';
//import db_client from './database.client';
//import { createIsomorphicFn } from '@tanstack/react-start';

 /* export const db = createIsomorphicFn()
  .server(() => db_server)
  .client(() => db_client); */

  
// export const db =  typeof window === "undefined" ? db_server : db_client;
/* export const db = 
  typeof window === "undefined"
    ? require("./database.server").db
    : require("./database.client").db; */

export const db = db_server; 