import bcrypt from 'bcrypt';

const createHashValue = async (val) => {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hashSync(val, salt);
  };
  
  const isValidPasswd = async (psw, encryptedPsw) => {
    return await bcrypt.compareSync(psw, encryptedPsw);
  };
  

  const compareHashedValues = async (value, hashedValue) => {
    return await bcrypt.compare(value, hashedValue);
  };


  const comparePassword = async (user, password) => {
    return await bcrypt.compareSync(password, user.password);
  };
  

  export {  createHashValue,  isValidPasswd, compareHashedValues, comparePassword }