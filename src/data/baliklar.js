const baliklar = [
  // Tatlı su - Canlı doğuranlar
  { ad: "Lepistes", bilimsel: "Poecilia reticulata" },
  { ad: "Molly", bilimsel: "Poecilia sphenops" },
  { ad: "Platy", bilimsel: "Xiphophorus maculatus" },
  { ad: "Kılıç Kuyruk", bilimsel: "Xiphophorus hellerii" },
  { ad: "Endler Lepistes", bilimsel: "Poecilia wingei" },
  { ad: "Balon Molly", bilimsel: "Poecilia latipinna" },

  // Tatlı su - Tetralar
  { ad: "Neon Tetra", bilimsel: "Paracheirodon innesi" },
  { ad: "Kardinal Tetra", bilimsel: "Paracheirodon axelrodi" },
  { ad: "Siyah Tetra", bilimsel: "Gymnocorymbus ternetzi" },
  { ad: "Alev Tetra", bilimsel: "Hyphessobrycon flammeus" },
  { ad: "Serpae Tetra", bilimsel: "Hyphessobrycon eques" },
  { ad: "Rummy Nose Tetra", bilimsel: "Hemigrammus rhodostomus" },
  { ad: "Elmas Tetra", bilimsel: "Moenkhausia pittieri" },
  { ad: "Lemon Tetra", bilimsel: "Hyphessobrycon pulchripinnis" },
  { ad: "Glow Light Tetra", bilimsel: "Hemigrammus erythrozonus" },
  { ad: "Buenos Aires Tetra", bilimsel: "Hyphessobrycon anisitsi" },
  { ad: "Kongo Tetra", bilimsel: "Phenacogrammus interruptus" },

  // Tatlı su - Barb
  { ad: "Kaplan Barb", bilimsel: "Puntigrus tetrazona" },
  { ad: "Kiraz Barb", bilimsel: "Puntius titteya" },
  { ad: "Altın Barb", bilimsel: "Barbodes semifasciolatus" },
  { ad: "Denison Barb", bilimsel: "Sahyadria denisonii" },
  { ad: "Beş Bantlı Barb", bilimsel: "Desmopuntius pentazona" },

  // Tatlı su - Çiklit
  { ad: "Melek Balığı", bilimsel: "Pterophyllum scalare" },
  { ad: "Diskus", bilimsel: "Symphysodon discus" },
  { ad: "Ram Çiklit", bilimsel: "Mikrogeophagus ramirezi" },
  { ad: "Apaçi Çiklit", bilimsel: "Apistogramma cacatuoides" },
  { ad: "Kribensis", bilimsel: "Pelvicachromis pulcher" },
  { ad: "Oscar", bilimsel: "Astronotus ocellatus" },
  { ad: "Jack Dempsey", bilimsel: "Rocio octofasciata" },
  { ad: "Flowerhorn", bilimsel: "Amphilophus hybrid" },
  { ad: "Frontosa", bilimsel: "Cyphotilapia frontosa" },
  { ad: "Elektrik Sarı", bilimsel: "Labidochromis caeruleus" },
  { ad: "Maingano", bilimsel: "Melanochromis cyaneorhabdos" },
  { ad: "Demasoni", bilimsel: "Pseudotropheus demasoni" },
  { ad: "Venustus", bilimsel: "Nimbochromis venustus" },
  { ad: "Kırmızı Zebra", bilimsel: "Maylandia estherae" },
  { ad: "Akvaryum Akarası", bilimsel: "Thorichthys meeki" },
  { ad: "Sevum", bilimsel: "Heros severus" },

  // Tatlı su - Labyrinth
  { ad: "Beta", bilimsel: "Betta splendens" },
  { ad: "Cüce Gurami", bilimsel: "Trichogaster lalius" },
  { ad: "İnci Gurami", bilimsel: "Trichopodus leerii" },
  { ad: "Mavi Gurami", bilimsel: "Trichopodus trichopterus" },
  { ad: "Bal Gurami", bilimsel: "Trichogaster chuna" },
  { ad: "Dev Gurami", bilimsel: "Osphronemus goramy" },

  // Tatlı su - Canlı yemler & Dip balıkları
  { ad: "Corydoras", bilimsel: "Corydoras paleatus" },
  { ad: "Panda Corydoras", bilimsel: "Corydoras panda" },
  { ad: "Sterbai Corydoras", bilimsel: "Corydoras sterbai" },
  { ad: "Otocinclus", bilimsel: "Otocinclus affinis" },
  { ad: "Pleco (Vatoz)", bilimsel: "Hypostomus plecostomus" },
  { ad: "Bristlenose Pleco", bilimsel: "Ancistrus cirrhosus" },
  { ad: "Zebra Pleco", bilimsel: "Hypancistrus zebra" },
  { ad: "Yoyo Loach", bilimsel: "Botia almorhae" },
  { ad: "Palyaço Loach", bilimsel: "Chromobotia macracanthus" },
  { ad: "Kuhli Loach", bilimsel: "Pangio kuhlii" },

  // Tatlı su - Rasbora
  { ad: "Harlequin Rasbora", bilimsel: "Trigonostigma heteromorpha" },
  { ad: "Galaxy Rasbora", bilimsel: "Danio margaritatus" },
  { ad: "Sivrisinek Rasbora", bilimsel: "Boraras brigittae" },

  // Tatlı su - Diğer
  { ad: "Zebra Balığı", bilimsel: "Danio rerio" },
  { ad: "Japon Balığı", bilimsel: "Carassius auratus" },
  { ad: "Koi", bilimsel: "Cyprinus rubrofuscus" },
  { ad: "Bıçak Balığı", bilimsel: "Chitala ornata" },
  { ad: "Arovana", bilimsel: "Osteoglossum bicirrhosum" },
  { ad: "Pirana", bilimsel: "Pygocentrus nattereri" },
  { ad: "Tatlısu Vatoz", bilimsel: "Potamotrygon motoro" },
  { ad: "Gümüş Köpekbalığı", bilimsel: "Balantiocheilos melanopterus" },
  { ad: "Kırmızı Kuyruk Kedi", bilimsel: "Phractocephalus hemioliopterus" },
  { ad: "Gökkuşağı Balığı", bilimsel: "Melanotaenia boesemani" },
  { ad: "Killifish", bilimsel: "Aphyosemion australe" },

  // Tatlı su - Karides & Salyangoz
  { ad: "Kiraz Karides", bilimsel: "Neocaridina davidi" },
  { ad: "Amano Karides", bilimsel: "Caridina multidentata" },
  { ad: "Kristal Karides", bilimsel: "Caridina cantonensis" },
  { ad: "Neritina Salyangoz", bilimsel: "Neritina natalensis" },
  { ad: "Elma Salyangoz", bilimsel: "Pomacea bridgesii" },

  // Deniz - Palyaço & Küçük
  { ad: "Palyaço Balığı", bilimsel: "Amphiprion ocellaris" },
  { ad: "Mavi Tang", bilimsel: "Paracanthurus hepatus" },
  { ad: "Sarı Tang", bilimsel: "Zebrasoma flavescens" },
  { ad: "Mandarin Balığı", bilimsel: "Synchiropus splendidus" },
  { ad: "Kraliyet Gramma", bilimsel: "Gramma loreto" },
  { ad: "Ateş Balığı", bilimsel: "Nemateleotris magnifica" },
  { ad: "Altı Çizgili Wrasse", bilimsel: "Pseudocheilinus hexataenia" },
  { ad: "Banggai Kardinal", bilimsel: "Pterapogon kauderni" },
  { ad: "Mavi Chromis", bilimsel: "Chromis viridis" },
  { ad: "İmparator Melek", bilimsel: "Pomacanthus imperator" },
];

export default baliklar;
