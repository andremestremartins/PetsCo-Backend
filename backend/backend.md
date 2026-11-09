Backend
Responsabilidades
Base de dados, modelação, autenticação, gestão de utilizadores, animais, serviços, marcações e denúncias, área de gestão, validações, segurança e integração com o Frontend.
Features
Autenticação e utilizadores
- Registo de cliente (nome, email, password, telemóvel).
- Login e logout.
- Passwords guardadas com hash (bcrypt), nunca em texto simples.
- Autenticação por token (JWT) enviado no header Authorization: Bearer <token>.
- Dois perfis (roles): cliente e admin.
- Middleware de proteção de rotas (só autenticados) e de autorização (só admin).
- Consultar e alterar dados pessoais.
- Alterar password.
Animais
- Cliente pode adicionar um ou mais animais à sua conta.
- Campos: nome, fotografia, espécie, raça, data de nascimento, sexo, peso, informações relevantes e necessidades especiais.
- Consultar, editar e remover os seus animais.
- Um cliente só consegue ver/editar os seus próprios animais (verificação de propriedade).
- Upload de fotografia (validação de tipo e tamanho).
Serviços
- CRUD completo (admin): criar, editar, remover e consultar.
- Campos: nome, descrição, preço, duração (opcional), imagem, categoria e ativo/inativo.
- Listagem pública com filtro por categoria.
- Os serviços do website vêm sempre da base de dados (nada hardcoded).
Marcações
- Cliente cria marcação escolhendo: animal, serviço, data e hora/período.
- Estados: Pendente, Confirmada, Concluída, Cancelada.
- Estado inicial: Pendente.
- Cliente consulta as suas marcações e os detalhes de cada uma.
- Cliente cancela marcação (apenas se Pendente/Confirmada e com a antecedência definida).
- Admin altera o estado da marcação.
- Validações:
  - A data não pode ser no passado.
  - O animal tem de pertencer ao cliente.
  - O serviço tem de estar ativo.
  - Não podem existir marcações duplicadas no mesmo horário.
- Alojamento: data de entrada e data de saída (saída posterior à entrada).
Sistema de denúncias
- Cliente pode criar uma denúncia através da sua conta.
- Campos: assunto, descrição, categoria e, opcionalmente, referência a uma marcação.
- Categorias:
  - Problema com serviço.
  - Problema com marcação.
  - Problema com animal.
  - Problema no website.
  - Outro.
- Estados: Pendente, Em análise, Resolvida, Rejeitada.
- Estado inicial: Pendente.
- Cliente pode consultar todas as suas denúncias e os respetivos estados.
- Cliente pode consultar os detalhes de cada denúncia.
- Admin pode listar e consultar todas as denúncias.
- Admin pode pesquisar e filtrar denúncias por estado, categoria e data.
- Admin pode alterar o estado de uma denúncia.
- Cada denúncia fica associada ao utilizador que a criou.
- Uma denúncia pode estar associada a uma marcação, mas essa associação é opcional.
- Um cliente só consegue consultar as suas próprias denúncias.
Área de gestão (admin)
- Serviços: criar, editar, remover e consultar.
- Clientes: listar, pesquisar por nome/email e ver detalhes.
- Animais: listar, pesquisar e ver o respetivo proprietário.
- Marcações: listar, filtrar por estado e por data, ver detalhes e alterar estado.
- Denúncias: listar, pesquisar, filtrar por estado/categoria/data, consultar detalhes e alterar estado.
- Dashboard (opcional): contagens de marcações pendentes, clientes, animais e denúncias pendentes.
Pesquisa e filtros
- Serviços por categoria.
- Marcações por estado e por data.
- Clientes por nome/email.
- Animais por nome/espécie/proprietário.
- Denúncias por estado, categoria e data.
- Filtros feitos no servidor via query params (ex.: ?estado=Pendente&data=2026-11-10).
Validações e erros
- Validação de todos os inputs no servidor (ex.: Joi, Zod ou express-validator).
- Email válido e único; password com mínimo de 8 caracteres.
- Códigos HTTP corretos (200, 201, 400, 401, 403, 404, 409, 500).
- Respostas de erro em formato consistente:
{
  "sucesso": false,
  "mensagem": "Email já registado",
  "erros": []
}
- Mensagens claras para o utilizador (o Frontend apresenta-as).
- Middleware global de tratamento de erros.
Base de dados
Tabelas
utilizadores
Campo	Tipo	Notas
id	INT PK AI	
nome	VARCHAR(100)	
email	VARCHAR(150)	UNIQUE
password_hash	VARCHAR(255)	
telemovel	VARCHAR(20)	
role	ENUM('cliente','admin')	default 'cliente'
criado_em	DATETIME	default now


animais
Campo	Tipo	Notas
id	INT PK AI	
utilizador_id	INT FK	→ utilizadores.id
nome	VARCHAR(100)	
fotografia	VARCHAR(255)	caminho/URL
especie	VARCHAR(50)	
raca	VARCHAR(100)	
data_nascimento	DATE	
sexo	ENUM('M','F')	
peso	DECIMAL(5,2)	kg
informacoes	TEXT	
necessidades_especiais	TEXT	


categorias_servico
Campo	Tipo
id	INT PK AI
nome	VARCHAR(80)


servicos
Campo	Tipo	Notas
id	INT PK AI	
categoria_id	INT FK	→ categorias_servico.id
nome	VARCHAR(100)	
descricao	TEXT	
preco	DECIMAL(8,2)	
duracao_minutos	INT NULL	não se aplica a alojamento
imagem	VARCHAR(255)	
ativo	BOOLEAN	default true


estados_marcacao
Campo	Tipo
id	INT PK AI
nome	VARCHAR(30)


Valores: Pendente, Confirmada, Concluída, Cancelada.
marcacoes
Campo	Tipo	Notas
id	INT PK AI	
utilizador_id	INT FK	→ utilizadores.id
animal_id	INT FK	→ animais.id
servico_id	INT FK	→ servicos.id
estado_id	INT FK	→ estados_marcacao.id
data	DATE	data da marcação/entrada
hora	TIME NULL	ou período (manhã/tarde)
data_fim	DATE NULL	só alojamento
observacoes	TEXT	
criado_em	DATETIME	


categorias_denuncia
Campo	Tipo
id	INT PK AI
nome	VARCHAR(80)


Categorias iniciais:
- Problema com serviço
- Problema com marcação
- Problema com animal
- Problema no website
- Outro
estados_denuncia
Campo	Tipo
id	INT PK AI
nome	VARCHAR(30)


Valores: Pendente, Em análise, Resolvida, Rejeitada.
denuncias
Campo	Tipo	Notas
id	INT PK AI	
utilizador_id	INT FK	→ utilizadores.id
marcacao_id	INT FK NULL	→ marcacoes.id; opcional
categoria_id	INT FK	→ categorias_denuncia.id
estado_id	INT FK	→ estados_denuncia.id
assunto	VARCHAR(150)	
descricao	TEXT	
criado_em	DATETIME	default now
atualizado_em	DATETIME	atualizado quando a denúncia é alterada


Relações
- Um utilizador tem muitos animais (1:N).
- Um utilizador tem muitas marcações (1:N).
- Um animal tem muitas marcações (1:N).
- Um serviço tem muitas marcações (1:N).
- Uma categoria de serviço tem muitos serviços (1:N).
- Um estado de marcação tem muitas marcações (1:N).
- Um utilizador tem muitas denúncias (1:N).
- Uma marcação pode estar associada a muitas denúncias (1:N); a associação é opcional em cada denúncia.
- Uma categoria de denúncia tem muitas denúncias (1:N).
- Um estado de denúncia tem muitas denúncias (1:N).
Regras de integridade
- Definir chaves estrangeiras com regras ON DELETE adequadas.
- Apagar um utilizador deve respeitar as relações com os seus animais, marcações e denúncias. Definir uma política consistente, por exemplo, impedir a eliminação física de utilizadores com histórico e optar por desativação da conta.
- Não permitir apagar serviços com marcações associadas; usar ativo = false.
- Não permitir apagar categorias ou estados que estejam associados a registos.
- A marcação associada a uma denúncia, quando indicada, tem de pertencer ao cliente que criou a denúncia.
- Um cliente só pode consultar os seus próprios animais, marcações e denúncias.
- Índices em utilizadores.email, animais.utilizador_id, marcacoes.utilizador_id, marcacoes.data, marcacoes.estado_id, denuncias.utilizador_id, denuncias.estado_id e denuncias.categoria_id.
- Dados iniciais (seed): estados de marcação, categorias de serviço, serviços de exemplo, estados de denúncia, categorias de denúncia e um utilizador admin.

API (endpoints)
Base URL: /api
Autenticação
Método	Rota	Acesso	Descrição
POST	/auth/registo	público	Criar conta
POST	/auth/login	público	Iniciar sessão (devolve token)
GET	/auth/me	autenticado	Dados do utilizador autenticado
PUT	/auth/me	autenticado	Alterar dados pessoais
PUT	/auth/password	autenticado	Alterar password


Serviços
Método	Rota	Acesso	Descrição
GET	/servicos	público	Listar (filtro ?categoria=)
GET	/servicos/:id	público	Detalhe
POST	/servicos	admin	Criar
PUT	/servicos/:id	admin	Editar
DELETE	/servicos/:id	admin	Remover/desativar
GET	/categorias	público	Listar categorias


Animais
Método	Rota	Acesso	Descrição
GET	/animais	cliente	Listar os meus animais
GET	/animais/:id	cliente	Detalhe
POST	/animais	cliente	Adicionar
PUT	/animais/:id	cliente	Editar
DELETE	/animais/:id	cliente	Remover


Marcações
Método	Rota	Acesso	Descrição
GET	/marcacoes	cliente	Listar as minhas marcações
GET	/marcacoes/:id	cliente	Detalhe
POST	/marcacoes	cliente	Criar marcação
PATCH	/marcacoes/:id/cancelar	cliente	Cancelar


Denúncias (cliente)
Método	Rota	Acesso	Descrição
POST	/denuncias	cliente	Criar denúncia
GET	/denuncias	cliente	Listar as minhas denúncias
GET	/denuncias/:id	cliente	Consultar detalhes de uma denúncia
GET	/categorias-denuncia	autenticado	Listar categorias de denúncia


Gestão (admin)
Método	Rota	Acesso	Descrição
GET	/admin/clientes?pesquisa=	admin	Listar/pesquisar clientes
GET	/admin/clientes/:id	admin	Detalhe do cliente
GET	/admin/animais?pesquisa=	admin	Listar/pesquisar animais (com proprietário)
GET	/admin/marcacoes?estado=&data=	admin	Listar/filtrar marcações
GET	/admin/marcacoes/:id	admin	Detalhe da marcação
PATCH	/admin/marcacoes/:id/estado	admin	Alterar estado da marcação
GET	/admin/denuncias?estado=&categoria=&data=	admin	Listar e filtrar denúncias
GET	/admin/denuncias/:id	admin	Consultar detalhes da denúncia
PATCH	/admin/denuncias/:id/estado	admin	Alterar estado da denúncia


API keys e variáveis de ambiente
Todas as chaves, segredos e credenciais ficam num ficheiro .env, que nunca deve ser enviado para o repositório.
Ficheiro .env (exemplo local)
# Servidor
PORT=3000
NODE_ENV=development

# Banco de Dados MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123
DB_NAME=petsco
DB_CONNECTION_LIMIT=10

# JWT (Authentication)
JWT_SECRET=achavedeapiemuitosecretaninguempodedescobrir123
JWT_EXPIRES_IN=1d

# CORS
FRONTEND_URL=

#API_KEY 
API_KEY=achavedeapiemuitosecretaninguempodedescobrir123

# Uploads
UPLOAD_MAX_SIZE_MB=5


Regras
- Adicionar .env ao .gitignore logo no início do projeto.
- Criar um .env.example com os mesmos nomes das variáveis, mas sem valores reais.
- O JWT_SECRET deve ser longo e aleatório. Gerar com:
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
- Cada elemento da equipa usa o seu próprio .env local.
- Os segredos devem ser partilhados em privado e nunca no GitHub, Discord público ou prints.
- Se uma chave for exposta por engano, deve ser trocada de imediato.
- Nunca escrever credenciais diretamente no código.
- Ler sempre as variáveis através de process.env.NOME_DA_VARIAVEL.
- Não colocar segredos no Frontend. Tudo o que é enviado para o navegador pode ser visto pelo utilizador.
- Uma API_KEY só deve ser mantida se existir uma funcionalidade concreta que a utilize; não substitui o JWT nem a autorização por roles.
Serviços externos
O enunciado não exige integrações externas, por isso não são necessárias API keys de terceiros para o projeto base. Caso a equipa avance com extensões, as chaves seguem as mesmas regras:
- Armazenamento de imagens (ex.: Cloudinary): CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.
- Envio de emails (ex.: Resend, SendGrid): EMAIL_API_KEY.
- Mapas no website (ex.: Google Maps): MAPS_API_KEY (usada no Frontend e com restrição por domínio).
Segurança
- Hash de passwords com bcrypt (salt rounds ≥ 10).
- Queries parametrizadas / ORM (proteção contra SQL Injection).
- CORS restrito ao URL do Frontend.
- Validação e sanitização de todos os inputs.
- Verificação de propriedade (um cliente nunca acede a dados de outro).
- Verificação de role em todas as rotas de admin.
- Upload: limitar tipos (jpg, png, webp) e tamanho.
- Não devolver nunca password_hash nas respostas.
- Mensagens de login genéricas ("Credenciais inválidas"), sem indicar se foi o email ou a password que falhou.
- Nas denúncias, verificar sempre que o utilizador autenticado é o proprietário da denúncia antes de devolver os seus detalhes.
- Ao criar uma denúncia com marcacao_id, confirmar que a marcação pertence ao utilizador autenticado.
- Apenas admins podem consultar todas as denúncias e alterar os seus estados.
- Não confiar no utilizador_id enviado pelo Frontend: obter o ID do utilizador a partir do JWT.
Estrutura de pastas
backend/
├── src/
│   ├── config/              # ligação à BD, variáveis de ambiente
│   ├── models/               # modelos / acesso a dados
│   ├── controllers/          # lógica de cada rota
│   ├── routes/               # definição dos endpoints
│   ├── middlewares/          # auth, roles, validação, erros, upload
│   ├── validators/           # schemas de validação
│   ├── utils/                # funções auxiliares
│   └── app.js
├── database/
│   ├── schema.sql            # criação das tabelas
│   └── seed.sql              # dados iniciais
├── uploads/                  # imagens enviadas
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
Integração com o Frontend
- Documentar todos os endpoints (método, rota, body, resposta e erros) e partilhar com o Frontend, por exemplo via Postman Collection ou Swagger.
- Utilizar um formato de resposta único e consistente.
- Combinar com o Frontend: nomes dos campos, formato das datas (YYYY-MM-DD) e estrutura dos erros.
- Disponibilizar cedo dados de teste (seed) para o Frontend poder trabalhar.
- Disponibilizar as categorias e os estados de denúncia através da API, evitando valores duplicados no Frontend.
- O Frontend deve apresentar ao cliente o estado atual das denúncias e permitir consultar os respetivos detalhes.
Plano por fases
Fase 1 — Base de dados e configuração
- Modelação da BD (diagrama ER).
- Criar schema.sql e seed.sql.
- Setup do projeto.
- Configurar .env, .env.example e .gitignore.
- Criar e testar a ligação à BD.
Fase 2 — Autenticação e funcionalidades principais
- Autenticação (registo, login e JWT).
- CRUD de serviços.
- CRUD de animais.
Fase 3 — Marcações e gestão
- Marcações (criação, estados e cancelamento).
- Área de gestão de clientes, animais e marcações.
Fase 4 — Sistema de denúncias
- Criar tabelas de categorias, estados e denúncias.
- Implementar criação e consulta de denúncias pelo cliente.
- Implementar listagem, filtros e alteração de estado pelo admin.
- Testar permissões e propriedade das denúncias.
Fase 5 — Integração e finalização
- Integração com Frontend.
- Testes (Postman/Insomnia).
- Correção de bugs.
- Documentação da API.
- Seed final.
Testes
- Testar todos os endpoints em Postman/Insomnia.
- Testar registo com dados válidos e inválidos.
- Testar email duplicado e password abaixo do mínimo.
- Testar token inválido ou expirado.
- Testar acesso de cliente a rotas de admin.
- Testar acesso a recursos pertencentes a outro utilizador.
- Testar upload com tipo de ficheiro não permitido e ficheiro demasiado grande.
- Testar criação de marcações com datas inválidas, serviço inativo ou horário ocupado.
- Testar regra de cancelamento e marcações duplicadas.
- Testar criação de denúncia com dados válidos.
- Testar criação de denúncia sem assunto, descrição ou categoria.
- Testar associação de uma denúncia a uma marcação de outro cliente (deve ser recusada).
- Testar consulta de denúncia pertencente a outro utilizador (deve ser recusada).
- Testar acesso de cliente aos endpoints de gestão de denúncias (deve ser recusado).
- Testar alteração do estado de uma denúncia por admin.
- Testar filtros de denúncias por estado, categoria e data