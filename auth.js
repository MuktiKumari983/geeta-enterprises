import { auth } from "./firebase.js";
import {
createUserWithEmailAndPassword,
signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

window.signup = async ()=>{
  try{
    await createUserWithEmailAndPassword(auth,email.value,password.value);
    alert("Signup successful ✅");
  }catch(e){
    if(e.code==="auth/email-already-in-use")
      alert("Email already registered");
    else if(e.code==="auth/invalid-email")
      alert("Invalid email");
    else if(e.code==="auth/weak-password")
      alert("Password must be 6+ characters");
    else
      alert("Signup failed");
  }
};

window.login = async ()=>{
  try{
    await signInWithEmailAndPassword(auth,email.value,password.value);
    window.location.href="index.html";
  }catch(e){
    alert("Login failed ❌");
  }
};