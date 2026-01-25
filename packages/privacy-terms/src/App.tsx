import { useState } from 'react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy')

  return (
    <div className="container">
      <h1>Atena - Legal</h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('privacy')}
          style={{
            backgroundColor: activeTab === 'privacy' ? '#4a9eff' : '#2a2a2a',
            color: activeTab === 'privacy' ? '#fff' : '#ccc',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Política de Privacidade
        </button>
        <button 
          onClick={() => setActiveTab('terms')}
          style={{
            backgroundColor: activeTab === 'terms' ? '#4a9eff' : '#2a2a2a',
            color: activeTab === 'terms' ? '#fff' : '#ccc',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Termos de Uso
        </button>
      </div>

      {activeTab === 'privacy' && (
        <div className="card">
          <h2>Política de Privacidade</h2>
          <p>Última atualização: {new Date().toLocaleDateString()}</p>
          
          <h3>1. Introdução</h3>
          <p>
            Bem-vindo ao Atena. Nós respeitamos sua privacidade e estamos comprometidos em proteger seus dados pessoais.
            Esta política de privacidade informará como cuidamos de suas informações pessoais quando você usa nosso aplicativo.
          </p>

          <h3>2. Coleta de Dados</h3>
          <p>
            Coletamos informações que você nos fornece diretamente, como ao criar uma conta, editar seu perfil ou enviar redações para correção.
            Isso pode incluir seu nome, endereço de e-mail e conteúdo das redações.
          </p>

          <h3>3. Uso de Dados</h3>
          <p>
            Usamos seus dados para fornecer e melhorar nossos serviços, incluindo a correção de redações via inteligência artificial
            e o gerenciamento de sua conta de usuário.
          </p>
          
          <h3>4. Permissões do Dispositivo</h3>
          <p>
            O aplicativo pode solicitar permissões para acessar sua câmera ou galeria de fotos. Isso é necessário estritamente para
            o recurso de envio de fotos de redações manuscritas.
          </p>

          <h3>5. Contato</h3>
          <p>
            Se tiver dúvidas sobre esta política, entre em contato conosco através do suporte no aplicativo.
          </p>
        </div>
      )}

      {activeTab === 'terms' && (
        <div className="card">
          <h2>Termos de Uso</h2>
          <p>Última atualização: {new Date().toLocaleDateString()}</p>

          <h3>1. Aceitação dos Termos</h3>
          <p>
            Ao acessar ou usar o aplicativo Atena, você concorda em cumprir estes Termos de Uso e todas as leis aplicáveis.
          </p>

          <h3>2. Uso do Serviço</h3>
          <p>
            Você concorda em usar o serviço apenas para fins legais e de acordo com estes termos. É proibido usar o serviço
            para qualquer atividade fraudulenta ou prejudicial.
          </p>

          <h3>3. Propriedade Intelectual</h3>
          <p>
            O serviço e seu conteúdo original, recursos e funcionalidades são e permanecerão de propriedade exclusiva do Atena.
          </p>

          <h3>4. Encerramento</h3>
          <p>
            Podemos encerrar ou suspender seu acesso imediatamente, sem aviso prévio ou responsabilidade, por qualquer motivo,
            incluindo, sem limitação, se você violar os Termos.
          </p>
        </div>
      )}
    </div>
  )
}

export default App
