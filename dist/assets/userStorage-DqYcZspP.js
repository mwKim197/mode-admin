function t(){const r=localStorage.getItem("userInfo");if(!r)return null;try{return JSON.parse(r)}catch{return null}}export{t as g};
