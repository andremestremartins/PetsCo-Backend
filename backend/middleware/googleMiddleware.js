//authGoogle.js
import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const googleRouter = Router();

const CLIENT_ID = '://googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

const MINHA_CHAVE_SECRETA_JWT = '12345678901234567890123456789012';

googleRouter.post('/google', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token do Google é obrigatório.' });
  }

  try {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, 
    });
    
    const payload = ticket.getPayload();
    const googleId = payload['sub'];
    const email = payload['email'];
    const name = payload['name'];


    const usuarioNoBanco = { id: "id_gerado_ou_existente", email, name }; 

    const meuJwt = jwt.sign(
      { id: usuarioNoBanco.id, email: usuarioNoBanco.email },
      MINHA_CHAVE_SECRETA_JWT,
      { expiresIn: '1d' } 
    );

    return res.status(200).json({
      message: 'Login com Google efetuado com sucesso!',
      token: meuJwt, 
      user: { name, email }
    });

  } catch (error) {
    console.error('Erro no login do Google:', error);
    return res.status(401).json({ error: 'Falha na autenticação com o Google.' });
  }
});

export default googleRouter;