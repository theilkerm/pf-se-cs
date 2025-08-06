class AppError extends Error {
  public statusCode: number;
  public status: 'fail' | 'error';
  public isOperational: boolean;
  public errors?: any[]; // YENİ EKLENEN OPSİYONEL ALAN

  constructor(message: string, statusCode: number, errors?: any[]) { // errors'u constructor'a ekle
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errors = errors; // YENİ EKLENEN SATIR

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;