// server.js - GOLDBLACKAGENCY BACKEND
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const path = require('path');

const app = express();

// Middleware CORS - PERMETTI TUTTI I DOMINI
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());
app.options('*', cors());

// Configurazione Prodotti
const prodotti = {
  'blog': {
    nome: 'Template Blog',
    prezzo: 55995,
    priceId: 'price_1SY8qIRO6ugtav5vKMgsAhKT',
    file: 'template-blog.zip'
  },
  'ecommerce': {
    nome: 'Template E-Commerce',
    prezzo: 285500,
    priceId: 'price_1SY8qgRO6ugtav5vHz1j4Iwy',
    file: 'template-ecommerce.zip'
  },
  'portfolio': {
    nome: 'Template Portfolio',
    prezzo: 49595,
    priceId: 'price_1SY8r7RO6ugtav5vs5VRF5Tn',
    file: 'template-portfolio.zip'
  },
  'cv-base': {
    nome: 'CV Template Base',
    prezzo: 1000,
    priceId: 'price_1SY8rhRO6ugtav5vk9DJSAFS',
    file: 'cv-base.zip'
  },
  'cv-pro': {
    nome: 'CV Template Pro',
    prezzo: 1500,
    priceId: 'price_1SY8sCRO6ugtav5vqedHQLLg',
    file: 'cv-pro.zip'
  },
  'cv-lusso': {
    nome: 'CV Template Lusso',
    prezzo: 2000,
    priceId: 'price_1SY8skRO6ugtav5vyKmt8kqR',
    file: 'cv-lusso.zip'
  }
};

// Endpoint Test
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'Server GoldBlackAgency funzionante!',
    timestamp: new Date().toISOString(),
    prodotti: Object.keys(prodotti)
  });
});

// Creazione Checkout Stripe
app.post('/api/create-checkout', async (req, res) => {
  try {
    const { productId } = req.body;
    
    console.log('🛒 Richiesta checkout per:', productId);
    
    if (!prodotti[productId]) {
      return res.status(400).json({ 
        error: 'Prodotto non trovato',
        prodottiDisponibili: Object.keys(prodotti)
      });
    }

    const prodotto = prodotti[productId];
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price: prodotto.priceId,
        quantity: 1,
      }],
      success_url: `${process.env.FRONTEND_URL || 'https://goldblackagency.com'}/success.html?session_id={CHECKOUT_SESSION_ID}&product=${productId}`,
      cancel_url: `${process.env.FRONTEND_URL || 'https://goldblackagency.com'}/cancel.html`,
      metadata: { 
        productId: productId,
        productName: prodotto.nome
      }
    });

    console.log('✅ Sessione Stripe creata:', session.id);
    
    res.json({ 
      success: true,
      id: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('❌ Errore Stripe:', error);
    res.status(500).json({ 
      success: false,
      error: 'Errore nella creazione del pagamento',
      details: error.message 
    });
  }
});

// Download File
app.get('/downloads/:filename', (req, res) => {
  const { filename } = req.params;
  
  const isValidFile = Object.values(prodotti).some(p => p.file === filename);
  
  if (!isValidFile) {
    return res.status(403).json({ error: 'File non autorizzato' });
  }

  const filePath = path.join(__dirname, 'downloads', filename);
  
  res.download(filePath, filename, (err) => {
    if (err) {
      console.error('Errore download:', err);
      res.status(404).json({ error: 'File non trovato' });
    }
  });
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    server: 'GoldBlackAgency',
    timestamp: new Date().toISOString()
  });
});

// Avvio Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ================================');
  console.log('   GoldBlackAgency Server');
  console.log('   ================================');
  console.log('');
  console.log(`   ✅ Server avviato su porta ${PORT}`);
  console.log(`   🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('   📌 Endpoints disponibili:');
  console.log('   GET    /api/test');
  console.log('   POST   /api/create-checkout');
  console.log('   GET    /downloads/:filename');
  console.log('   GET    /health');
  console.log('');
  console.log('   ⚡ Pronto per ricevere richieste!');
  console.log('================================');
  console.log('');
});

module.exports = app;
