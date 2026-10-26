const unsplash = (id) =>
  `https://images.unsplash.com/photo-${id}?q=80&w=2400&auto=format&fit=crop`;

export const searchSlides = [
  { src: unsplash("1637501435770-4fe1ebd226e1"), title: "Russia", slug: "russia" },
  { src: unsplash("1601923146328-310db041a805"), title: "Canada", slug: "canada" },
  { src: unsplash("1483729558449-99ef09a8c325"), title: "Brazil", slug: "brazil" },
  { src: unsplash("1545569341-9eb8b30979d9"), title: "Japan", slug: "japan" },
  { src: unsplash("1505993597083-3bd19fb75e57"), title: "Indonesia", slug: "indonesia" },
];

export const filterSlides = [
  { src: unsplash("1472017053394-b29fded587cd"), title: "Malaysia", slug: "malaysia" },
  { src: unsplash("1694160804354-79f76ae59951"), title: "Italy", slug: "italy" },
  { src: unsplash("1462651567147-aa679fd1cfaf"), title: "Switzerland", slug: "switzerland" },
  { src: unsplash("1496372412473-e8548ffd82bc"), title: "India", slug: "india" },
  { src: unsplash("1508500709478-37a0e8d6603c"), title: "Sweden", slug: "sweden" },
];
