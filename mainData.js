const PRODUCTS_PER_PAGE = 6;
const products = [
  {
    id: 1,
    name: "Stone Island",
    price: 8,
    category: "Iphone",
    colors: ["Negro", "Blanco", "Azul", "Rojo"],
    models: ["iPhone 13", "iPhone 13 Pro", "iPhone 14", "iPhone 14 Pro", "iPhone 15", "iPhone 15 Pro"],
    features: [
      {
        icon: "shield-alt",
        text: "Protección contra caídas"
      },
      {
        icon: "tint",
        text: "Resistente al agua"
      },
      {
        icon: "box",
        text: "Incluye protector de pantalla"
      },
      {
        icon: "magnet",
        text: "Compatible con MagSafe"
      }
    ],
    images: [
      "images/StoneIsland/StoneIsland1.png",
      "images/StoneIsland/StoneIsland2.png",
      "images/StoneIsland/StoneIsland3.png",
      "images/StoneIsland/StoneIsland4.png",
      "images/StoneIsland/StoneIsland5.png",
      "images/StoneIsland/StoneIsland6.png",
      "images/StoneIsland/StoneIsland7.png"
    ],
    description:
      "Carcasa de Iphone desde Ipone 7 a hasta el 16. Diseño de Stone Island"
  },
  {
    id: 2,
    name: "Stone Island",
    price: 8,
    category: "Iphone",
    images: [
      "images/StoneIsland2/StoneIsland1.png",
      "images/StoneIsland2/StoneIsland2.png",
      "images/StoneIsland2/StoneIsland3.png",
      "images/StoneIsland2/StoneIsland4.png",
      "images/StoneIsland2/StoneIsland5.png",
      "images/StoneIsland2/StoneIsland6.png",
      "images/StoneIsland2/StoneIsland7.png",
      "images/StoneIsland2/StoneIsland8.png"
    ],
    description:
      "Carcasa de Iphone desde Ipone 7 a hasta el 16. Diseño de Stone Island 2"
  },
  {
    id: 3,
    name: "Cargador de Iphone",
    price: 3.5,
    category: "accesorios",
    image: "images/CargadorIphoneTipoC.png",
    description: "Cargador rápido con un enchufe tipo C de 20W para iPhones"
  },
  {
    id: 4,
    name: "Limpiador de Airpods",
    price: 3,
    category: "accesorios iphone",
    image: "images/LimpiadorDeAirpods.png",
    description: "Limpiador de Airpods para eliminar la suciedad y el polvo"
  }
];


//  {
//          Productos con dscuento
//         id: 1,
//         name: "Cargador de Iphone",
//         price: 3.5,
//         oldPrice: 24.99, //Opcional para descuentos
//         category: "iphone",
//         image: "https://via.placeholder.com/300x300",
//         description: "Cargador rápido con un enchufe tipo C de 20W para iPhones",
//         discount: 20
// },

// Añadir sección de ofertas
const specialOffers = [
    {
        id: 'offer1',
        title: 'Super Oferta Limitada',
        description: 'Fundas premium seleccionadas con diseños exclusivos',
        discount: '40',
        image: 'images/StoneIsland/StoneIsland1.png',
        type: 'main',
        endTime: '48h',
        buttonText: 'Ver Ofertas'
    },
    {
        id: 'offer2',
        title: 'Pack Duo',
        description: 'Llévate dos fundas al precio de una',
        badge: '2x1',
        image: 'images/StoneIsland/StoneIsland2.png',
        type: 'secondary',
        buttonText: 'Comprar Ahora'
    },
    {
        id: 'offer3',
        title: 'Bundle Protección Total',
        description: 'Funda + Protector de Pantalla',
        badge: 'HOT',
        image: 'images/StoneIsland/StoneIsland3.png',
        type: 'secondary',
        buttonText: 'Ver Bundle'
    }
];

window.specialOffers = specialOffers;
