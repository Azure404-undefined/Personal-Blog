declare namespace API {
  namespace Auth {
    interface LoginParams {
    username: string;
    password: string;
  }

  interface LoginResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    sub: string;
  }
  }
}