export interface UserService {
  list(): Promise<unknown>;
}

export const USER_SERVICE = Symbol("USER_SERVICE");
