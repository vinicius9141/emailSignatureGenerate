document.addEventListener('DOMContentLoaded', async function () {
  const user = auth.currentUser;
  if (!user) {
      window.location.href = 'login.html';
      return;
  }

  const userDoc = await db.collection('users').doc(user.uid).get();
  if (!userDoc.exists || !userDoc.data().isPaid) {
      alert('Você precisa pagar para acessar esta funcionalidade.');
      window.location.href = 'login.html';
      return;
  }

  document.getElementById('signatureFormContainer').style.display = 'block';
});

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
  });
}

async function generateSignature() {
  const layout = document.getElementById('layout').value;
  const profilePicture = document.getElementById('profilePicture').files[0];
  const logo = document.getElementById('logo').files[0];
  const certificate1 = document.getElementById('certificate1').files[0];
  const certificate2 = document.getElementById('certificate2').files[0];
  const certificate3 = document.getElementById('certificate3').files[0];
  const certificate4 = document.getElementById('certificate4').files[0];
  const name = document.getElementById('name').value;
  const title = document.getElementById('title').value;
  const phone = document.getElementById('phone').value;
  const email = document.getElementById('email').value;
  const website = document.getElementById('website').value;

  let profilePictureUrl = '';
  let logoUrl = '';
  let certificateUrls = [];

  if (profilePicture) {
      profilePictureUrl = await readFileAsDataURL(profilePicture);
  }

  if (logo) {
      logoUrl = await readFileAsDataURL(logo);
  }

  if (certificate1) {
      certificateUrls.push(await readFileAsDataURL(certificate1));
  }
  if (certificate2) {
      certificateUrls.push(await readFileAsDataURL(certificate2));
  }
  if (certificate3) {
      certificateUrls.push(await readFileAsDataURL(certificate3));
  }
  if (certificate4) {
      certificateUrls.push(await readFileAsDataURL(certificate4));
  }

  let certificatesHtml = '';
  for (let i = 0; i < certificateUrls.length; i++) {
      certificatesHtml += `<img src="${certificateUrls[i]}" alt="Certificado ${i + 1}" class="certificates">`;
  }

  let signatureHtml;
  if (layout === 'layout1') {
      signatureHtml = `
          <div class="perfil-container">
              <div class="perfil-info-container">
                  <div>
                      ${profilePictureUrl ? `<img class="perfil" src="${profilePictureUrl}" alt="Perfil">` : ''}
                      ${logoUrl ? `<div class="logo-container"><img src="${logoUrl}" alt="Logo Empresa"></div>` : ''}
                  </div>
                  <div class="info">
                      <strong>${name}</strong><br>
                      ${title}<br>
                      <div class="contact-info">
                          ${phone ? `<a href="tel:+${phone}">${phone}</a><br>` : ''}
                          ${email ? `<a href="mailto:${email}">${email}</a><br>` : ''}
                          ${website ? `<a href="${website}" style="color: green;">${website}</a><br>` : ''}
                      </div>
                  </div>
              </div>
          </div>
          <div class="certificates-container">
              ${certificatesHtml}
          </div>
      `;
  } else if (layout === 'layout2') {
      signatureHtml = `
          <div class="perfil-container">
              <div class="perfil-info-container">
                  <div>
                      ${profilePictureUrl ? `<img class="perfil" src="${profilePictureUrl}" alt="Perfil">` : ''}
                  </div>
                  <div class="info" style="margin-left: 20px;">
                      <strong>${name}</strong><br>
                      ${title}<br>
                      <div class="contact-info">
                          ${phone ? `<a href="tel:+${phone}">${phone}</a><br>` : ''}
                          ${email ? `<a href="mailto:${email}">${email}</a><br>` : ''}
                          ${website ? `<a href="${website}" style="color: green;">${website}</a><br>` : ''}
                      </div>
                  </div>
              </div>
              ${logoUrl ? `<div class="logo-container" style="margin-left: auto; margin-top: 0;"><img src="${logoUrl}" alt="Logo Empresa"></div>` : ''}
          </div>
          <div class="certificates-container" style="margin-top: 20px;">
              ${certificatesHtml}
          </div>
      `;
  } else if (layout === 'layout3') {
      signatureHtml = `
          <div class="layout3-container">
              ${profilePictureUrl ? `<img class="perfil" src="${profilePictureUrl}" alt="Perfil">` : ''}
              <div class="info">
                  <strong>${name}</strong><br>
                  ${title}<br>
                  <div class="contact-info">
                      ${phone ? `<a href="tel:+${phone}">${phone}</a><br>` : ''}
                      ${email ? `<a href="mailto:${email}">${email}</a><br>` : ''}
                      ${website ? `<a href="${website}" style="color: green;">${website}</a><br>` : ''}
                  </div>
              </div>
              ${logoUrl ? `<div class="logo-container"><img src="${logoUrl}" alt="Logo Empresa"></div>` : ''}
          </div>
          <div class="certificates-container layout3">
              ${certificatesHtml}
          </div>
      `;
  }

  document.getElementById('signaturePreview').innerHTML = signatureHtml;
  document.getElementById('generatedCode').value = signatureHtml;
}

function copyToClipboard() {
  const generatedCode = document.getElementById('generatedCode');
  generatedCode.select();
  generatedCode.setSelectionRange(0, 99999); // Para dispositivos móveis
  document.execCommand("copy");
  alert("Código copiado para a área de transferência!");
}
