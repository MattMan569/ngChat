/**
 * Convert the value specified in the environment variable to a Date ISO string
 */
export const expires = () => {
  if (!process.env.JWT_EXPIRES_IN) {
    throw new Error('Environment variable JWT_EXPIRES_IN is undefined.');
  }

  return new Date(Date.now() + parseInt(process.env.JWT_EXPIRES_IN, 10)).toISOString();
};

export default expires;
