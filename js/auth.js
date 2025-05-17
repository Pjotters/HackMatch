// auth.js - eenvoudige SDK voor login/logout en userinfo, gedeeld tussen MediaMatch en HackMatch
const Auth = {
  getUser() {
    return {
      userId: localStorage.getItem('mediamatch_userid'),
      naam: localStorage.getItem('mediamatch_naam'),
      userType: localStorage.getItem('mediamatch_usertype'),
      verified: localStorage.getItem('mediamatch_verified') === 'true',
    };
  },
  isLoggedIn() {
    return !!localStorage.getItem('mediamatch_userid');
  },
  login({ userId, naam, userType, verified }) {
    localStorage.setItem('mediamatch_userid', userId);
    localStorage.setItem('mediamatch_naam', naam);
    localStorage.setItem('mediamatch_usertype', userType);
    localStorage.setItem('mediamatch_verified', verified ? 'true' : 'false');
  },
  logout() {
    localStorage.removeItem('mediamatch_userid');
    localStorage.removeItem('mediamatch_naam');
    localStorage.removeItem('mediamatch_usertype');
    localStorage.removeItem('mediamatch_verified');
  }
};

// Login-formulier injecteren indien niet ingelogd
function requireLogin(onLogin) {
  if (Auth.isLoggedIn()) {
    if (onLogin) onLogin(Auth.getUser());
    return;
  }
  // Toon login-formulier inline
  document.body.innerHTML = `
    <main style="max-width:400px;margin:5em auto 2em auto;background:#232c44cc;padding:2em 2em 2.5em 2em;border-radius:16px;box-shadow:0 8px 40px #0007;">
      <h2>Inloggen</h2>
      <form id="loginForm">
        <input type="text" id="loginUser" placeholder="Gebruikersnaam" required><br>
        <input type="password" id="loginPass" placeholder="Wachtwoord" required><br>
        <button type="submit">Login</button>
      </form>
      <div id="loginStatus" style="margin-top:1em;"></div>
    </main>
  `;
  document.getElementById('loginForm').onsubmit = function(e) {
    e.preventDefault();
    const user = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, pass })
    }).then(r=>r.json()).then(data=>{
      if (data.success) {
        Auth.login({
          userId: data.userId,
          naam: data.naam,
          userType: data.type,
          verified: data.verified
        });
        if (onLogin) onLogin(Auth.getUser());
        else location.reload();
      } else {
        document.getElementById('loginStatus').textContent = 'Login mislukt.';
      }
    });
  };
}
