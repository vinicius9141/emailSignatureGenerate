async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        toastr.success('Login realizado com sucesso.');
        setTimeout(() => {
            window.location.href = 'signature.html';
        }, 2000);
    } catch (error) {
        toastr.error('Erro ao fazer login: ' + error.message);
    }
}
// Configuração do Toastr
toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": true,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}

async function register() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        toastr.error('As senhas não coincidem. Por favor, verifique.');
        return;
    }

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        await db.collection('users').doc(user.uid).set({
            email: user.email,
            isPaid: false  // Set this to true after the user has paid
        });

        toastr.success('Cadastro realizado com sucesso. Faça login para continuar.');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    } catch (error) {
        toastr.error('Erro ao cadastrar: ' + error.message);
    }
}



function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function handleFileUpload(event, id) {
    const fileInput = event.target;
    const fileButton = document.getElementById(id + 'Button');
    if (fileInput.files.length > 0) {
        fileButton.setAttribute('data-uploaded', 'true');
    } else {
        fileButton.removeAttribute('data-uploaded');
    }
    generateSignature();
}

function checkPaymentStatusAndGenerateSignature() {
    const user = firebase.auth().currentUser;
    if (user) {
        const userId = user.uid;
        firebase.firestore().collection('users').doc(userId).get().then(doc => {
            if (doc.exists && doc.data().isPaid) {
                generateSignature();
                document.getElementById('codeContainer').style.display = 'block';
            } else {
                showPaymentModal();
            }
        }).catch(error => {
            console.error('Erro ao verificar o status de pagamento:', error);
            toastr.error('Erro ao verificar o status de pagamento.');
        });
    } else {
        toastr.error('Você precisa estar logado para gerar a assinatura.');
    }
}

function showPaymentModal() {
    const modal = document.getElementById('paymentModal');
    const span = document.getElementsByClassName('close')[0];
    modal.style.display = 'block';
    span.onclick = function() {
        modal.style.display = 'none';
    }
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
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
        // Novo layout para o Layout 2
        signatureHtml = `
            <div class="email-signature">
                <table cellpadding="0" cellspacing="0" style="width: 100%;">
                    <tr>
                        <td rowspan="2" style="width: 100px;">
                            ${profilePictureUrl ? `<img class="perfil" src="${profilePictureUrl}" alt="Perfil">` : ''}
                        </td>
                        <td class="info">
                            <strong>${name}</strong><br>
                            ${title}<br>
                            <div class="contact-info">
                                ${phone ? `<a href="tel:+${phone}">${phone}</a><br>` : ''}
                                ${email ? `<a href="mailto:${email}">${email}</a><br>` : ''}
                                ${website ? `<a href="${website}" style="color: green;">${website}</a><br>` : ''}
                            </div>
                        </td>
                        <td rowspan="2" style="width: 100px;">
                            ${logoUrl ? `<div class="logo-container"><img src="${logoUrl}" alt="Logo Empresa"></div>` : ''}
                        </td>
                    </tr>
                </table>
                <div class="certificates-container" style="margin-top: 10px;">
                    ${certificatesHtml}
                </div>
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
    toastr.success('Código copiado para a área de transferência!');
}


// Modal logic
function showModal() {
  const modal = document.getElementById("paymentModal");
  const span = document.getElementsByClassName("close")[0];
  modal.style.display = "block";
  span.onclick = function() {
      modal.style.display = "none";
  }
  window.onclick = function(event) {
      if (event.target == modal) {
          modal.style.display = "none";
      }
  }
}
