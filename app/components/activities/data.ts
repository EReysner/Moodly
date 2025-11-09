export const CATEGORIES = [
  {
    id: "1",
    title: "Meditaciones",
    icon: "🧘",
    tabIcon: "fitness-outline",
    color: "#A78BFA",
    activities: [
      {
        id: "101",
        title: "Meditación para reducir ansiedad",
        duration: "10 min",
        favorite: false,
        description:
          "Una meditación guiada para reducir la ansiedad y el estrés. Te guiará a través de ejercicios de respiración y visualización para calmar tu mente y relajar tu cuerpo.",
        image:
          "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3",
        progress: 0,
      },
      {
        id: "102",
        title: "Meditación de atención plena",
        duration: "15 min",
        favorite: false,
        description:
          "Practica la atención plena con esta meditación guiada que te ayudará a conectar con el momento presente y desarrollar mayor conciencia de tus pensamientos y emociones.",
        image:
          "https://images.unsplash.com/photo-1604431696980-94e85f602d9f?ixlib=rb-4.0.3",
        progress: 35,
      },
      {
        id: "103",
        title: "Meditación para conciliar el sueño",
        duration: "20 min",
        favorite: true,
        description:
          "Esta meditación te ayudará a relajarte profundamente y preparar tu mente y cuerpo para un sueño reparador. Ideal para practicar antes de dormir.",
        image:
          "https://images.unsplash.com/photo-1474418397713-7ede21d49118?ixlib=rb-4.0.3",
        progress: 75,
      },
      {
        id: "104",
        title: "Meditación de gratitud",
        duration: "8 min",
        favorite: false,
        description:
          "Cultiva un sentimiento de gratitud y apreciación por las cosas positivas en tu vida con esta breve pero poderosa práctica meditativa.",
        image:
          "https://images.unsplash.com/photo-1602192509154-0b900ee1f851?ixlib=rb-4.0.3",
        progress: 0,
      },
    ],
  },
  {
    id: "2",
    title: "Ejercicios",
    icon: "🏃",
    tabIcon: "body-outline",
    color: "#6B8BFF",
    activities: [
      {
        id: "201",
        title: "Respiración consciente",
        duration: "5 min",
        favorite: true,
        description:
          "Técnica de respiración que ayuda a reducir el estrés y aumentar la sensación de calma. Perfecta para momentos de tensión o para iniciar el día con claridad mental.",
        image:
          "https://images.unsplash.com/photo-1518459031867-a89b944bffe4?ixlib=rb-4.0.3",
        progress: 50,
      },
      {
        id: "202",
        title: "Estiramientos antiestrés",
        duration: "12 min",
        favorite: false,
        description:
          "Serie de estiramientos suaves diseñados para liberar la tensión acumulada en el cuerpo y promover la relajación física y mental.",
        image:
          "https://images.unsplash.com/photo-1599447332412-6bc6830c815d?ixlib=rb-4.0.3",
        progress: 0,
      },
      {
        id: "203",
        title: "Yoga restaurativo",
        duration: "25 min",
        favorite: false,
        description:
          "Secuencia de yoga suave y reparadora que utiliza apoyos para mantener posturas cómodas por más tiempo, permitiendo una relajación profunda.",
        image:
          "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?ixlib=rb-4.0.3",
        progress: 0,
      },
    ],
  },
  {
    id: "3",
    title: "Lecturas",
    icon: "📚",
    tabIcon: "book-outline",
    color: "#4CAF50",
    activities: [
      {
        id: "301",
        title: "Entendiendo la ansiedad",
        duration: "8 min lectura",
        favorite: false,
        description:
          "Artículo informativo sobre los mecanismos de la ansiedad, sus causas y estrategias efectivas para manejarla en el día a día.",
        image:
          "https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3",
        progress: 0,
      },
      {
        id: "302",
        title: "Hábitos para el bienestar",
        duration: "10 min lectura",
        favorite: true,
        description:
          "Guía práctica sobre pequeños hábitos diarios que pueden transformar tu bienestar mental y emocional a largo plazo.",
        image:
          "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3",
        progress: 80,
      },
      {
        id: "303",
        title: "El poder de la autocompasión",
        duration: "12 min lectura",
        favorite: false,
        description:
          "Explora cómo cultivar una actitud amable hacia ti mismo puede ser transformador para tu salud mental y tus relaciones con los demás.",
        image:
          "https://images.unsplash.com/photo-1576086213369-97a306d36557?ixlib=rb-4.0.3",
        progress: 25,
      },
    ],
  },
  {
    id: "4",
    title: "Sonidos",
    icon: "🎵",
    tabIcon: "musical-notes-outline",
    color: "#FF9800",
    activities: [
      {
        id: "401",
        title: "Lluvia relajante",
        duration: "30 min",
        favorite: false,
        description:
          "Sonido ambiental de lluvia suave ideal para relajarse, concentrarse en el trabajo o conciliar el sueño.",
        image:
          "https://images.unsplash.com/photo-1501691223387-dd0500403074?ixlib=rb-4.0.3",
        progress: 0,
      },
      {
        id: "402",
        title: "Música para meditación",
        duration: "45 min",
        favorite: true,
        description:
          "Composición musical diseñada específicamente para acompañar prácticas de meditación o para crear un ambiente tranquilo.",
        image:
          "https://images.unsplash.com/photo-1468164016595-6108e4c60c8b?ixlib=rb-4.0.3",
        progress: 15,
      },
      {
        id: "403",
        title: "Sonidos del bosque",
        duration: "60 min",
        favorite: false,
        description:
          "Inmersiva experiencia auditiva que recrea la tranquilidad de un bosque, con cantos de pájaros, crujidos de hojas y arroyos suaves.",
        image:
          "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3",
        progress: 0,
      },
      {
        id: "404",
        title: "Ondas del océano",
        duration: "50 min",
        favorite: false,
        description:
          "El rítmico sonido de las olas del mar, perfecto para la relajación profunda o como ruido blanco para dormir mejor.",
        image:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3",
        progress: 40,
      },
    ],
  },
];
