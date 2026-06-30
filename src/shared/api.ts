export type InitResponse = {
  type: 'init';
  postId: string;
  username: string;
};

export type ApiErrorResponse = {
  status: 'error';
  message: string;
};
