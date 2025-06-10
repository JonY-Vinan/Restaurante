import { QRCodeCanvas } from "qrcode.react";

function Home() {
  const url = "http://192.168.8.112:5173/mobile/menu";

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Bienvenido al Restaurante</h1>
      <p>Escanea el código QR para crear un menú desde el móvil:</p>
      <QRCodeCanvas value={url} size={200} />
    </div>
  );
}

export default Home;
