const { useState, useEffect } = React;

// Composants d'icônes simples en SVG
const Eye = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOff = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const Copy = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const Send = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const Clock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const Shield = ({ className, width = "20", height = "20" }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const CheckCircle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const AlertCircle = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const RefreshCw = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10"/>
    <polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);

const Activity = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const Flame = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);

const App = () => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSpecial, setIncludeSpecial] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oneTimeUse, setOneTimeUse] = useState(true);
  
  // États pour la récupération via lien
  const [retrievedPassword, setRetrievedPassword] = useState('');
  const [retrieveError, setRetrieveError] = useState('');
  const [retrieveSuccess, setRetrieveSuccess] = useState(false);
  const [wasOneTime, setWasOneTime] = useState(false);

  // Paliers d'expiration: 30min, 1h, 2h, 4h, 8h, 12h, 24h, 36h, 48h, 72h
  const expirationSteps = [0.5, 1, 2, 4, 8, 12, 24, 36, 48, 72];
  const [expirationIndex, setExpirationIndex] = useState(1); // Par défaut 1h

  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let chars = '';
    if (includeUpper) chars += uppercase;
    if (includeLower) chars += lowercase;
    if (includeNumbers) chars += numbers;
    if (includeSpecial) chars += special;
    if (chars === '') chars = lowercase;
    
    let newPassword = '';
    for (let i = 0; i < length; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    setPassword(newPassword);
    setShareLink('');
    setCopied(false);
  };

  const createShareLink = async () => {
    if (!password) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/secret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          password, 
          expiration: expirationSteps[expirationIndex],
          oneTimeUse: oneTimeUse
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la création du lien');
      }
      
      const data = await response.json();
      const link = `${window.location.origin}?id=${data.id}`;
      setShareLink(link);
      setLinkCopied(false);
    } catch (error) {
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, setCopiedState) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    });
  };

  const formatExpiration = (hours) => {
    if (hours < 1) return `${hours * 60}min`;
    return `${hours}h`;
  };

  const resetToGenerate = () => {
    setRetrievedPassword('');
    setRetrieveError('');
    setRetrieveSuccess(false);
    setWasOneTime(false);
  };

  // Vérifier si on a un ID dans l'URL au chargement
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (id) {
      setLoading(true);
      
      fetch(`/api/secret/${id}`)
        .then(res => {
          if (!res.ok) {
            return res.json().then(err => { throw new Error(err.error); });
          }
          return res.json();
        })
        .then(data => {
          setRetrievedPassword(data.password);
          setRetrieveSuccess(true);
          setWasOneTime(data.oneTimeUse);
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch(error => {
          setRetrieveError(error.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="text-blue-400" width="48" height="48" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">SecureShare</h1>
          <p className="text-slate-300">Partage sécurisé de mots de passe temporaires</p>
        </div>

        {/* Affichage de récupération si un mot de passe a été récupéré */}
        {(retrieveSuccess || retrieveError) ? (
          <div className="bg-slate-800 rounded-xl shadow-2xl p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4 text-blue-400">
                  <Activity />
                </div>
                <p className="text-slate-300">Récupération en cours...</p>
              </div>
            ) : retrieveSuccess ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-green-400 mb-4">
                  <CheckCircle />
                  <span className="font-medium">Mot de passe récupéré avec succès</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Mot de passe</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={retrievedPassword} 
                      readOnly 
                      className="w-full bg-slate-900 text-white px-4 py-3 rounded-lg pr-24 focus:ring-2 focus:ring-blue-500 outline-none text-center" 
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                      <button onClick={() => setShowPassword(!showPassword)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                        {showPassword ? <EyeOff /> : <Eye />}
                      </button>
                      <button onClick={() => copyToClipboard(retrievedPassword, setCopied)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                        {copied ? <CheckCircle /> : <Copy />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className={`${wasOneTime ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-blue-500/10 border-blue-500/30'} border rounded-lg p-4`}>
                  <p className={`${wasOneTime ? 'text-yellow-400' : 'text-blue-400'} text-sm`}>
                    {wasOneTime ? (
                      <>⚠️ Ce mot de passe a été supprimé du serveur et ne sera plus accessible via ce lien.</>
                    ) : (
                      <>ℹ️ Ce lien reste actif jusqu'à expiration. Le mot de passe peut être consulté plusieurs fois.</>
                    )}
                  </p>
                </div>
                <button 
                  onClick={resetToGenerate}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Générer un nouveau mot de passe
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-red-400 mb-4">
                  <AlertCircle />
                  <span className="font-medium">{retrieveError}</span>
                </div>
                <button 
                  onClick={resetToGenerate}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Retour à la génération
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Page de génération normale */
          <div className="bg-slate-800 rounded-xl shadow-2xl p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Mot de passe généré
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Cliquez sur Générer pour créer un mot de passe"
                  className="w-full bg-slate-900 text-white px-4 py-3 rounded-lg pr-24 focus:ring-2 focus:ring-blue-500 outline-none text-center"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(password, setCopied)}
                    disabled={!password}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {copied ? <CheckCircle /> : <Copy />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Longueur: {length} caractères
              </label>
              <input
                type="range"
                min="8"
                max="32"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" checked={includeUpper} onChange={(e) => setIncludeUpper(e.target.checked)} className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-blue-500" />
                <span className="text-slate-300">Majuscules (A-Z)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" checked={includeLower} onChange={(e) => setIncludeLower(e.target.checked)} className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-blue-500" />
                <span className="text-slate-300">Minuscules (a-z)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" checked={includeNumbers} onChange={(e) => setIncludeNumbers(e.target.checked)} className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-blue-500" />
                <span className="text-slate-300">Chiffres (0-9)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" checked={includeSpecial} onChange={(e) => setIncludeSpecial(e.target.checked)} className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-blue-500" />
                <span className="text-slate-300">Spéciaux (!@#$...)</span>
              </label>
            </div>

            <button onClick={generatePassword} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
              <RefreshCw />
              Générer un mot de passe
            </button>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Clock />
                Expiration: {formatExpiration(expirationSteps[expirationIndex])}
              </label>
              <input
                type="range"
                min="0"
                max="9"
                value={expirationIndex}
                onChange={(e) => setExpirationIndex(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>30min</span>
                <span>1h</span>
                <span>4h</span>
                <span>12h</span>
                <span>24h</span>
                <span>72h</span>
              </div>
            </div>

            {/* Option de destruction à la première lecture */}
            <div className="bg-slate-900 rounded-lg p-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <Flame />
                  <div>
                    <span className="text-slate-300 font-medium block">Destruction à la première lecture</span>
                    <span className="text-xs text-slate-500">Le lien sera inutilisable après la première consultation</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={oneTimeUse}
                  onChange={(e) => setOneTimeUse(e.target.checked)}
                  className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-orange-600 focus:ring-orange-500"
                />
              </label>
            </div>

            <button onClick={createShareLink} disabled={!password || loading} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
              {loading ? <Activity /> : <Send />}
              {loading ? 'Création...' : 'Créer un lien de partage'}
            </button>

            {shareLink && (
              <div className="bg-slate-900 p-4 rounded-lg border border-green-500/30">
                <label className="block text-sm font-medium text-green-400 mb-2">Lien de partage généré</label>
                <div className="flex gap-2">
                  <input type="text" value={shareLink} readOnly className="flex-1 bg-slate-800 text-white px-3 py-2 rounded text-sm" />
                  <button onClick={() => copyToClipboard(shareLink, setLinkCopied)} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors">
                    {linkCopied ? <CheckCircle /> : <Copy />}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {oneTimeUse ? (
                    <>⚠️ Ce lien expirera dans {formatExpiration(expirationSteps[expirationIndex])} et sera supprimé après une seule consultation</>
                  ) : (
                    <>ℹ️ Ce lien expirera dans {formatExpiration(expirationSteps[expirationIndex])} et peut être consulté plusieurs fois</>
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 bg-slate-800/50 rounded-lg p-4 text-center">
          <p className="text-sm text-slate-400 flex items-center justify-center gap-2">
            <Shield width="16" height="16" />
            Chiffrement AES-256-GCM • Stockage en mémoire uniquement • One-time use optionnel
          </p>
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));