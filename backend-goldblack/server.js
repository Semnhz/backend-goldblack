// server.js - VERSIONE COMPLETA E CORRETTA
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const path = require('path');

const app = express();

// Middleware ESSENZIALI
app.use(cors({
  origin: ['http://localhost:8000', 'https://tuodominio.com'], // ⬅️ MODIFICA CON I TUOI DOMINI
  credentials: true
}));
app.use(express.json());

// =============================================
// CONFIGURAZIONE PRODOTTI CON VERI PRICE IDs
// =============================================
const prodotti = {
  'blog': {
    nome: 'Template Blog',
    prezzo: 55995,
    priceId: 'price_1SWhSZKFaTfN0EN0ND1lRPw8', // ⬅️ VERIFICA SE È CORRETTO
    file: 'template-blog.zip'
  },
  'ecommerce': {
    nome: 'Template E-Commerce',
    prezzo: 285500,
    priceId: 'price_1SWhUdKFaTfN0EN0gYSnXP1L', // ⬅️ VERIFICA SE È CORRETTO
    file: 'template-ecommerce.zip'
  },
  'portfolio': {
    nome: 'Template Portfolio',
    prezzo: 49595,
    priceId: 'price_1SWhWbKFaTfN0EN00xl8oKnS', // ⬅️ VERIFICA SE È CORRETTO
    file: 'template-portfolio.zip'
  },
  'cv-base': {
    nome: 'CV Template Base',
    prezzo: 1000,
    priceId: 'price_1SWhXbKFaTfN0EN0jVMsKaOF', // ⬅️ VERIFICA SE È CORRETTO
    file: 'cv-base.zip'
  },
  'cv-pro': {
    nome: 'CV Template Pro',
    prezzo: 1500,
    priceId: 'price_1SWhYaKFaTfN0EN0hFsgJOtK', // ⬅️ VERIFICA SE È CORRETTO
    file: 'cv-pro.zip'
  },
  'cv-lusso': {
    nome: 'CV Template Lusso',
    prezzo: 2000,
    priceId: 'price_1SWhYyKFaTfN0EN0yOogMPQC', // ⬅️ VERIFICA SE È CORRETTO
    file: 'cv-lusso.zip'
  }
};

// =============================================
// ENDPOINT DI TEST
// =============================================
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'Server GoldBlackAgency funzionante!',
    timestamp: new Date().toISOString(),
    prodotti: Object.keys(prodotti)
  });
});

// =============================================
// ENDPOINT CHECKOUT
// =============================================
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
    
    console.log('📦 Prodotto selezionato:', prodotto.nome);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price: prodotto.priceId,
        quantity: 1,
      }],
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:8000'}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:8000'}/cancel.html`,
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

// =============================================
// ENDPOINT DOWNLOAD (semplificato)
// =============================================
app.get('/downloads/:filename', (req, res) => {
  const { filename } = req.params;
  
  // Verifica che il file sia autorizzato
  const isValidFile = Object.values(prodotti).some(p => p.file === filename);
  
  if (!isValidFile) {
    return res.status(403).json({ error: 'File non autorizzato' });
  }

  const filePath = path.join(__dirname, 'downloads', filename);
  res.download(filePath, (err) => {
    if (err) {
      console.error('Errore download:', err);
      res.status(404).json({ error: 'File non trovato' });
    }
  });
});

// =============================================
// HEALTH CHECK
// =============================================
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    server: 'GoldBlackAgency',
    timestamp: new Date().toISOString()
  });
});

// =============================================
// AVVIO SERVER
// =============================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ================================');
  console.log('   GoldBlackAgency Server');
  console.log('   ================================');
  console.log('');
  console.log(`   ✅ Server avviato su porta ${PORT}`);
  console.log(`   🌍 URL: http://localhost:${PORT}`);
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































app.post('/api/create-checkout', async (req, res) => {
  try {
    const { productId } = req.body;
    
    console.log('🛒 Richiesta checkout per:', productId);
    console.log('🔑 Stripe Key:', process.env.STRIPE_SECRET_KEY ? 'Presente' : 'Mancante');
    
    if (!prodotti[productId]) {
      return res.status(400).json({ error: 'Prodotto non trovato' });
    }

    const prodotto = prodotti[productId];
    console.log('📦 Prodotto:', prodotto);
    
    // TEST: Verifica che Stripe sia configurato
    console.log('🔍 Test configurazione Stripe...');
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price: prodotto.priceId,
        quantity: 1,
      }],
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:8000'}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:8000'}/cancel.html`,
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
    console.error('❌ Errore Stripe DETTAGLIATO:');
    console.error(' - Tipo:', error.type);
    console.error(' - Codice:', error.code);
    console.error(' - Parametro:', error.param);
    console.error(' - Messaggio:', error.message);
    console.error(' - Stack:', error.stack);
    
    res.status(500).json({ 
      success: false,
      error: 'Errore nella creazione della sessione',
      details: error.message,
      type: error.type
    });
  }
});