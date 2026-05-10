const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../../config/supabase');

const login = async (username, password) => {
  const { data: user, error } = await supabase
    .from('usuarios')
    .select('id_usuario, username, password_hash, rol')
    .eq('username', username)
    .maybeSingle();

  console.log('Error Supabase:', error);
  console.log('Usuario encontrado:', user);
  console.log('Hash recibido:', user?.password_hash);
  console.log('Password recibido:', password);

  if (error || !user) {
    return null;
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  console.log('Password match:', passwordMatch);

  if (!passwordMatch) {
    return null;
  }

  const expiresIn = parseInt(process.env.JWT_EXPIRES_IN, 10) || 7200;

  const token = jwt.sign(
    { id_usuario: user.id_usuario, username: user.username, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn }
  );

  return { token, expiresIn, tokenType: 'Bearer' };
};

module.exports = { login };