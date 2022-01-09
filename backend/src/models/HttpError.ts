class HttpError extends Error {
  constructor(
    message: string,
    public errorCode: number,
    public data?: Object[]
  ) {
    super(message); // Add a message property
  }
}

export default HttpError;
