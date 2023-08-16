type KakaoUser = {
  email: string;
  nickname: string;
  photo: string;
};

export type KakaoRequest = Request & { user: KakaoUser };

/* Google Strategy */
type GoogleUser = {
  email: string;
  firstName: string;
  lastName: string;
  photo: string;
};

export type GoogleRequest = Request & { user: GoogleUser };
