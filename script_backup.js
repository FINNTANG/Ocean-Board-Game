document.addEventListener('DOMContentLoaded', function() {
    // å¼ºåˆ¶åˆ·æ–°å­—ä½“å’Œæ ·å¼
    const style = document.createElement('style');
    style.textContent = `
        @font-face {
            font-family: 'Hind Madurai';
            src: url('HindMadurai-Regular.ttf?t=${Date.now()}') format('truetype');
            font-weight: 400;
            font-style: normal;
            font-display: swap;
        }
        * {
            font-family: 'Hind Madurai', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }
    `;
    document.head.appendChild(style);
    
    // Game state
    const gameState = {
        currentScreen: 'start',
        selectedCharacters: [],
        animationActive: false,
        gameMetrics: {
            industrialStance: 0,
            ecologicalStance: 0,
            year: 1
        },
        currentEvent: null,
        selectedOption: null,
        factShown: false,
        recordEventDrawn: [],
        selectedOptionsByYear: {} // æ–°å¢žï¼šè®°å½•æ¯å¹´é€‰æ‹©çš„é€‰é¡¹
    };
    
    // å°†gameStateæš´éœ²ä¸ºå…¨å±€å˜é‡
    window.gameState = gameState;

    // Characters data
    const characters = [
        { id: 'politician', name: 'Politician', icon: 'ðŸ‘¨â€âš–ï¸' },
        { id: 'business', name: 'Business Owner', icon: 'ðŸ’¼' },
        { id: 'scientist', name: 'Scientist', icon: 'ðŸ§ª' },
        { id: 'educator', name: 'Educator', icon: 'ðŸ“š' },
        { id: 'fisher', name: 'Fisher', icon: 'ðŸŽ£' },
        { id: 'influencer', name: 'Influencer', icon: 'ðŸ“±' }
    ];

    // SVG ICONSå¯¹è±¡ï¼Œç´§è·Ÿåœ¨charactersåŽé¢
    const SVG_ICONS = {
        educator: `<svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" fill="#2080D3"/><path d="M67.269 44.025H78.6621V75H67.269M67.269 44.025V75M67.269 44.025V37.9724H54.4517V43.669M67.269 75H54.4517M54.4517 75V43.669M54.4517 75H43.0586M54.4517 43.669H43.0586M43.0586 43.669V75M43.0586 43.669V34.056H33.0897V40.8207M43.0586 75H33.0897M33.0897 75H21.6966V40.8207H33.0897M33.0897 75V40.8207M25.969 46.5172H28.8172M25.969 69.3034H28.8172M37.006 39.3966H39.1422M37.006 69.3034H39.1422M46.975 49.3655H50.5353M46.975 69.3034H50.5353M58.3681 43.669H63.3526M58.3681 69.3034H63.3526M71.1853 49.3655H75.1017M71.1853 69.3034H75.1017M16 36.0897L50.1793 19L84.3586 36.0897" stroke="white" stroke-width="2.27862" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        politician: `<svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" fill="#2080D3"/><path d="M28.7659 54.087L28.2635 50.174H72.1053L71.5471 54.087M28.7659 54.087L31.5793 76H68.4212L71.5471 54.087M28.7659 54.087H20.5268L15.0005 43.1305M15.0005 43.1305V38.4348C14.9906 37.841 15.1303 37.6488 15.7373 37.6522H81.3158M15.0005 43.1305H85M85 43.1305L79.4737 54.087H71.5471M85 43.1305V38.4348C84.9866 37.8916 84.8915 37.6628 84.2632 37.6521L81.3158 37.6522M81.3158 37.6522C81.4174 33.2523 80.774 31.1181 77.6316 28.2609M77.6316 28.2609C78.8456 27.2939 78.7369 25.5218 78.3685 24.3479C78 23.1739 76.8948 22 75.0527 22C72.8422 22 72.1955 24.0607 72.1053 24.3478C71.7369 25.5217 71.8129 27.1676 72.8422 28.2609C73.9187 29.4044 76.158 29.4348 77.6316 28.2609Z" stroke="white" stroke-width="3" stroke-linejoin="round"/></svg>`,
        business: `<svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" fill="#2080D3"/><path d="M58.2617 30.5087V25.8605C58.2617 23.7151 57.189 23 55.0437 23H44.3169C41.814 23 40.7413 24.0727 40.7413 25.8605V30.5087H24.2937C20.6739 30.3893 19.9546 31.3442 20.003 34.0843V53.7499M79 61.9738V70.9127C79 73.4156 78.2849 75.2034 75.0669 75.2034C75.0669 75.2034 26.7966 75.2034 24.2937 75.2034C21.7908 75.2034 19.9145 73.9345 20.003 70.9127V53.7499M64.3402 30.5087H75.0669C77.9655 30.5284 79 31.5814 79 34.7994V54.4651C79 57.3255 77.2122 57.3255 75.0669 57.3255H53.971M20.003 53.7499C20.003 55.8953 21.0757 57.3255 23.221 57.3255C25.3664 57.3255 44.6745 57.3255 44.6745 57.3255V52.6773C44.6863 51.8961 44.9014 51.6426 45.7472 51.6046H52.5408C53.6638 51.635 53.9622 51.8785 53.971 52.6773V61.9738C53.9976 62.8167 53.971 63.0464 53.2559 63.0464C52.5407 63.0464 46.1047 63.0464 46.1047 63.0464" stroke="white" stroke-width="3.09508" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        scientist: `<svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" fill="#2080D3"/><path d="M42.9721 23C46.172 23 53.372 23 56.572 23M42.9721 23C39.7721 23 39.7721 17 42.9721 17C46.172 17 53.372 17 56.572 17C59.7721 17 59.7721 23 56.572 23M42.9721 23V27M56.572 23V33.4C60.9459 36.9928 62.172 37.4307 67.7721 42.6C73.3721 47.7693 77.7277 63 67.7721 74.2C66.4206 75.7204 64.9421 77.0197 63.3721 78.1018M42.9721 27H47.7721M42.9721 27V41.8M42.9721 41.8V43.4C38.1665 47.1886 37.3971 47.4 32.1721 42.6C26.947 47.8 21.7719 62.2 31.372 73.4C33.1528 75.4776 35.1829 77.1974 37.3721 78.549M42.9721 41.8H50.1721M50.1721 74.6V71.4M50.1721 59L51.7721 55.4M50.1721 59L47.7721 58.6M50.1721 59V66.8M51.7721 55.4C50.9721 53 51.135 51.2193 51.7721 50.2C53.7721 47 56.6758 46.448 62.5721 45C61.7737 49.3869 60.5721 53.6667 58.5721 55C56.5721 56.3333 54.1721 56.2 51.7721 55.4ZM47.7721 58.6C46.9721 55.8 46.0468 54.6034 44.1721 53.8C41.3721 52.6 38.2057 54.2647 34.5721 55.4C36.9721 58.6 39.3472 61.4 42.5721 61.4C44.9721 61.4 46.0479 60.6952 47.7721 58.6ZM50.1721 66.8L53.3721 65.8M50.1721 66.8V71.4M53.3721 65.8C53.3721 63.4 54.1721 62.2694 55.3721 61.4C56.5721 60.5306 59.7721 59.8 64.5721 61C62.5243 64.2861 61.6211 66.4755 58.9721 67.8C56.5721 69 54.5721 67.8 53.3721 65.8ZM37.3721 78.549C38.2659 77.2746 38.8847 76.4437 40.1721 75.8C40.9721 75.4 41.7402 75.21 43.7721 75.4C45.8748 73.1697 46.9721 72.2 50.1721 71.4M37.3721 78.549C45.3822 83.4947 55.522 83.5124 63.3721 78.1018M50.1721 71.4C52.2855 71.7121 53.4907 72.0591 55.7721 73.8C57.6336 73.9404 58.581 74.24 60.1721 75C62.4077 76.2154 62.9014 76.8935 63.3721 78.1018" stroke="white" stroke-width="2.56" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        fisher: `<svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" fill="#2080D3"/><path d="M57.9904 32.6301V18.0827M57.9904 32.6301C54.3884 32.9607 54.3884 37.5894 57.9904 37.9201M57.9904 32.6301C61.5922 32.9607 61.5922 37.5894 57.9904 37.9201M57.9904 37.9201V72.9661C57.9904 80.9011 72.0706 80.9011 72.0706 72.9661V66.023M72.0706 66.023L68.7962 69.6599M72.0706 66.023L76 69.6599M28.8475 49.4919H27.2103C24.2632 49.4919 24.2632 55.7737 27.2103 55.7737H28.5201M28.8475 49.4919C29.3796 42.0699 30.791 38.8741 35.7239 35.2751M28.8475 49.4919H48.1669M35.7239 35.2751H41.618M35.7239 35.2751L36.3787 19.7358C37.0336 17.4214 39.9807 17.4214 40.6356 19.7358L41.618 35.2751M41.618 35.2751C46.7351 40.1399 48.0089 43.2965 48.1669 49.4919M48.1669 49.4919H49.4767C52.0962 49.4919 52.0962 55.7737 49.4767 55.7737H48.4943M28.5201 55.7737C29.4384 63.4271 31.4326 66.354 36.7062 69.9905M28.5201 55.7737H48.4943M36.7062 69.9905H40.3082M36.7062 69.9905L37.3611 78.2561C37.6886 79.248 39.3258 79.248 39.6533 78.2561L40.3082 69.9905M40.3082 69.9905C45.5473 67.0149 47.1497 64.5726 48.4943 55.7737" stroke="white" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        influencer: `<svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" fill="#2080D3"/><path d="M34.5 26.9H35.1M38.7 26.9H45M37.5 72.8H44.4M57 49.4C57 49.4 57 70.1 57 72.8C57 75.5 56.1001 76.1 53.4 76.1C50.6999 76.1 30.2999 76.1 27.6 76.1C24.9001 76.1 24 74.9 24 72.8C24 70.7 24 28.1 24 26C24 23.9 24.9 23 27.6 23C30.3 23 50.4 23 53.4 23C56.4 23 57 24.2 57 26C57 27.8 57 49.4 57 49.4ZM57 49.4H64.2M64.2 70.1C62.4001 70.1 61.2 70.1 61.2 68.6C61.2 67.1 60.9999 31 61 29C61.0001 27 64 27.5 64.8001 27.5M68.4 68H73.2M68.4 71.9H73.2M37.2 49.1L44.1 44.6M37.8 51.8L43.8 55.1M64.8 65.3C64.7999 66.8 64.8 73.1 64.8 74.6C64.8 76.1 64.8 76.1 66.3 76.1C67.8 76.1 74.3999 76.1 75.6 76.1C76.8001 76.1 76.8001 76.1 76.8 74.6C76.7999 73.1 76.7999 66.8 76.8 65.3C76.8001 63.8 76.8001 63.8 75.3 63.8C73.7999 63.8 67.7999 63.8 66.3 63.8C64.8001 63.8 64.8001 63.8 64.8 65.3ZM64.8 24.2V33.8C64.8001 35 64.8 35 66 35H75.6C76.8 35 76.8 35 76.8 33.8V24.2C76.8 23 76.8 23 75.3 23H66.3C65 23.0001 64.8001 23 64.8 24.2ZM64.5 44.6C64.5 46.2469 64.5 54.2 64.5 54.2C64.5 55.7 64.5 55.7 66.3 55.7H75.3C76.8 55.7 76.8 55.7 76.8 54.2V44.6C76.8 43.1 76.8 43.1 75.3 43.1H66C64.5 43.1 64.5 42.9531 64.5 44.6Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="34.8001" cy="50.6" r="2.6" fill="white" stroke="white" stroke-width="2"/><circle cx="46.2001" cy="43.4" r="2.6" fill="white" stroke="white" stroke-width="2"/><circle cx="46.2001" cy="56" r="2.6" fill="white" stroke="white" stroke-width="2"/><path d="M68.5967 27.1774C69.3001 26.3 70.3072 27.0083 70.8001 27.8C71.293 27.0083 72.3001 26.3 73.0326 27.1774C74.0019 28.3385 71.8882 30.1912 70.8147 31.4C69.3364 29.7722 67.6601 28.3458 68.5967 27.1774Z" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M69.0001 52.4V46.4L73.2001 49.4L69.0001 52.4Z" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    };

    // Events data
    const eventsData = [
        {
            id: 1,
            year: 1,
            title: "Seaside Development",
            description: "One of the seaside area in your city is looking underdeveloped. Some are suggesting to build a harbor.",
            options: [
                { 
                    id: "A", 
                    text: "Build Large Harbor.",
                    effectsDisplay: "Fisher credit -5. All other Personal Credit +10.",
                    effects: { industrialStance: 20, ecologicalStance: 0 },
                    additionalDeck: "1A"
                },
                { 
                    id: "B", 
                    text: "Reject harbor proposal.",
                    effectsDisplay: "No immediate Credit change.",
                    effects: { industrialStance: 0, ecologicalStance: 10 },
                    additionalDeck: ""
                },
                { 
                    id: "C", 
                    text: "Build fishing infrastructure.", 
                    effectsDisplay: "Fisher Credit +10.",
                    effects: { industrialStance: 10, ecologicalStance: 0 },
                    additionalDeck: ""
                }
            ],
            factContent: {
                title: "Real Story: The Colombo Port City Project",
                introduction: "In 2014, Sri Lanka approved the Colombo Port City project â€” a massive harbor and artificial island built on reclaimed ocean just off the capital.",
                impact: "Promoted as a way to boost tourism and global investment, the project drastically changed the coastline but also caused major backlash.",
                consequences: [
                    "Local fisher communities lost access to traditional fishing grounds.",
                    "Environmental groups warned of rising erosion and marine habitat loss.",
                    "The project sparked international concern over foreign control of the reclaimed land."
                ],
                conclusion: "To this day, Colombo Port City remains controversial â€” a symbol of the trade-off between rapid development and long-term ecological and social stability.",
                attribution: "By Aileen Cho for ENR September 17, 2020"
            }
        },
        // ç¬¬äºŒå¹´å¤§äº‹ä»¶
        {
            id: 2,
            year: 2,
            title: "Source of Energy",
            description: "Your city is determining a long-term energy supply strategy, a decision that will shape both its development and identity.",
            options: [
                {
                    id: "A",
                    text: "Approve fossil fuel as the city's primary energy source.",
                    effectsDisplay: "Politician +10 Credit, Business Owner +10 Credit.",
                    effects: { industrialStance: 20, ecologicalStance: -20 },
                    additionalDeck: "2A"
                },
                {
                    id: "B",
                    text: "Invest in a wind farm project along the coast.",
                    effectsDisplay: "All players +5 Credit.",
                    effects: { industrialStance: 5, ecologicalStance: 10 },
                    additionalDeck: ""
                },
                {
                    id: "C",
                    text: "Develop a tidal energy facility using offshore currents.",
                    effectsDisplay: "Scientist +10 Credit, Fisher â€“5 Credit.",
                    effects: { industrialStance: 10, ecologicalStance: -5 },
                    additionalDeck: "2C"
                }
            ],
            factContent: {
                title: "Real Story: Coastal Energy Choices",
                introduction: "Cities worldwide face tough choices about energy. In the UK, the Drax Power Station, once coal-powered, shifted to biomass and renewables, but not without controversy. Meanwhile, coastal wind farms like Hornsea Project One have become the world's largest offshore wind farm, powering over a million homes.",
                impact: "Fossil fuels offer reliability but contribute to climate change and pollution. Wind and tidal projects are cleaner but can disrupt marine and coastal ecosystems, and sometimes face local opposition.",
                consequences: [
                    "Fossil fuel reliance increases carbon emissions and air pollution.",
                    "Wind farms can affect bird migration and local fishing routes.",
                    "Tidal energy projects may alter tidal flows and impact marine habitats."
                ],
                conclusion: "Every energy choice involves trade-offs between economic growth, environmental health, and community interests. Coastal cities must weigh these carefully for a sustainable future.",
                attribution: "References: BBC News, The Guardian, National Geographic, 2023."
            }
        },
        // ç¬¬ä¸‰å¹´å¤§äº‹ä»¶
        {
            id: 3,
            year: 3,
            title: "Waste Management",
            description: "With growing waste volumes, your city must choose a sustainable waste management system.",
            options: [
                {
                    id: "A",
                    text: "Build a waste-to-energy converter that burns trash to generate power.",
                    effectsDisplay: "All players +5 Credit.",
                    effects: { industrialStance: 10, ecologicalStance: 10 },
                    additionalDeck: "3A"
                },
                {
                    id: "B",
                    text: "Allocate land near the shore for a permanent coastal landfill.",
                    effectsDisplay: "Business Owner +10 Credit, Politician â€“10 Credit.",
                    effects: { industrialStance: 25, ecologicalStance: 0 },
                    additionalDeck: "3B"
                },
                {
                    id: "C",
                    text: "Establish a public recycling center and encouraging community involvement.",
                    effectsDisplay: "Educator +10 Credit, Influencer +10 Credit.",
                    effects: { industrialStance: 0, ecologicalStance: 20 },
                    additionalDeck: ""
                }
            ],
            factContent: {
                title: "Real Story: Urban Waste Solutions",
                introduction: "Cities worldwide are innovating waste management. In Sweden, waste-to-energy plants convert nearly half of household waste into electricity and heat, reducing landfill use. In contrast, some coastal cities still rely on landfills, risking pollution and habitat loss. Community recycling programs, like those in San Francisco, have achieved recycling rates above 80%.",
                impact: "Waste-to-energy reduces landfill but can emit pollutants. Landfills are cheap but threaten coastal and marine environments. Recycling centers foster community engagement and reduce resource consumption, but require public participation.",
                consequences: [
                    "Waste-to-energy plants can release dioxins and require strict emission controls.",
                    "Coastal landfills may leak toxins into the ocean and harm wildlife.",
                    "Recycling programs depend on citizen involvement and effective sorting."
                ],
                conclusion: "No single solution is perfect. Sustainable waste management balances technology, cost, and community action for long-term urban health.",
                attribution: "References: World Economic Forum, National Geographic, The Guardian, 2022."
            }
        },
        // ç¬¬å››å¹´å¤§äº‹ä»¶
        {
            id: 4,
            year: 4,
            title: "Animal Law and Facility",
            description: "As marine life becomes a topic of public concern, the city must decide how to handle animal welfare policies.",
            options: [
                {
                    id: "A",
                    text: "Enact strict animal protection laws that prohibit captivity and display.",
                    effectsDisplay: "No immediate Credit change.",
                    effects: { industrialStance: 0, ecologicalStance: 10 },
                    additionalDeck: 0,
                    nextYear7Lock: ["B", "C"] // é€‰æ‹©Aï¼Œç¬¬ä¸ƒå¹´Bã€Cé”å®š
                },
                {
                    id: "B",
                    text: "Legalize marine animal performances and displays for profit.",
                    effectsDisplay: "Business Owner +10 Credit, Influencer +10 Credit.",
                    effects: { industrialStance: 5, ecologicalStance: -5 },
                    additionalDeck: 0,
                    nextYear7Lock: ["A", "C"] // é€‰æ‹©Bï¼Œç¬¬ä¸ƒå¹´Aã€Cé”å®š
                },
                {
                    id: "C",
                    text: "Build a research center for marine animal control and education.",
                    effectsDisplay: "Educator +10 Credit, Scientist +10 Credit.",
                    effects: { industrialStance: 0, ecologicalStance: 5 },
                    additionalDeck: 0,
                    nextYear7Lock: ["A", "B"] // é€‰æ‹©Cï¼Œç¬¬ä¸ƒå¹´Aã€Bé”å®š
                }
            ],
            factContent: {
                title: "Real Story: Marine Animal Welfare Policies",
                introduction: "Public concern for marine animal welfare has led to diverse policies worldwide. In 2016, California banned orca performances and captive breeding at SeaWorld. Meanwhile, some countries still allow marine animal shows for tourism revenue. Research centers, like the Monterey Bay Aquarium, focus on education and conservation.",
                impact: "Strict animal protection laws can improve welfare but may limit economic opportunities. Legalizing performances can boost tourism but faces ethical criticism. Research and education centers foster awareness and scientific progress.",
                consequences: [
                    "Bans on captivity can reduce animal suffering but may impact local economies.",
                    "Marine animal shows can attract tourists but often draw protests from activists.",
                    "Research centers require funding but can lead to better conservation outcomes."
                ],
                conclusion: "Balancing animal welfare, economic interests, and public education is a challenge for coastal cities worldwide.",
                attribution: "References: BBC, National Geographic, Monterey Bay Aquarium, 2022."
            }
        },
        // ç¬¬äº”å¹´å¤§äº‹ä»¶
        {
            id: 5,
            year: 5,
            title: "Disaster Prevention",
            description: "As the city expands, officials must decide whether to invest in civil protection or allocate funds on other priorities.",
            options: [
                {
                    id: "A",
                    text: "Invest heavily in seawalls, floodgates, and emergency infrastructure.",
                    effectsDisplay: "All players â€“20 Credit.",
                    effects: { industrialStance: 10, ecologicalStance: 0 },
                    additionalDeck: "",
                    nextYear9Lock: ["B", "C"] // é€‰æ‹©Aï¼Œç¬¬ä¹å¹´Bã€Cé”å®š
                },
                {
                    id: "B",
                    text: "Launch a public education campaign focused on disaster drills and awareness.",
                    effectsDisplay: "Educator +10 Credit, all others â€“10 Credit.",
                    effects: { industrialStance: 0, ecologicalStance: 10 },
                    additionalDeck: "5B",
                    nextYear9Lock: ["A", "C"] // é€‰æ‹©Bï¼Œç¬¬ä¹å¹´Aã€Cé”å®š
                },
                {
                    id: "C",
                    text: "Save funds for future use.",
                    effectsDisplay: "No immediate Credit change.",
                    effects: { industrialStance: 5, ecologicalStance: 5 },
                    additionalDeck: "",
                    nextYear9Lock: ["A", "B"] // é€‰æ‹©Cï¼Œç¬¬ä¹å¹´Aã€Bé”å®š
                }
            ],
            factContent: {
                title: "Real Story: Urban Disaster Prevention Choices",
                introduction: "Cities worldwide face tough decisions on disaster prevention. Tokyo has invested billions in seawalls and floodgates after devastating tsunamis. New York City has launched public education campaigns and drills after Hurricane Sandy. Some cities, like Miami, have chosen to save funds for future resilience projects.",
                impact: "Heavy infrastructure can protect lives but is costly. Public education increases awareness but may not prevent all damage. Saving funds offers flexibility but risks being unprepared.",
                consequences: [
                    "Seawalls and floodgates reduce flood risk but require ongoing maintenance and investment.",
                    "Education campaigns empower citizens but need regular engagement.",
                    "Saving funds can help future projects but may leave the city vulnerable in the short term."
                ],
                conclusion: "Effective disaster prevention requires balancing immediate protection, public engagement, and long-term planning.",
                attribution: "References: The New York Times, BBC, National Geographic, 2022."
            }
        },
        // ç¬¬å…­å¹´å¤§äº‹ä»¶
        {
            id: 6,
            year: 6,
            title: "Deciding Education Curriculum",
            description: "Your city's first curriculum plan will shape how future generations view nature, technology, and responsibility.",
            options: [
                {
                    id: "A",
                    text: "Focus education on environmental ethics and marine conservation.",
                    effectsDisplay: "Educator +5 Credit, Influencer +5 Credit.",
                    effects: { industrialStance: -5, ecologicalStance: 20 },
                    additionalDeck: 0
                },
                {
                    id: "B",
                    text: "Promote urban growth and industrialization history in school programs.",
                    effectsDisplay: "Politician +5 Credit, Business Owner +5 Credit.",
                    effects: { industrialStance: 5, ecologicalStance: 5 },
                    additionalDeck: 0
                },
                {
                    id: "C",
                    text: "Prioritize science, critical thinking, and civic resilience in the curriculum.",
                    effectsDisplay: "Scientist +5 Credit, Fisher +5 Credit.",
                    effects: { industrialStance: 0, ecologicalStance: 5 },
                    additionalDeck: 0
                }
            ],
            factContent: {
                title: "Real Story: Curriculum Choices and Societal Impact",
                introduction: "Education systems worldwide shape how students perceive the environment and society. Finland's curriculum emphasizes critical thinking and sustainability. In Singapore, environmental education is integrated into science and social studies. Some US states focus on STEM and civic engagement.",
                impact: "Curriculum choices influence values, innovation, and resilience. Emphasizing conservation can foster stewardship, while industrial history highlights economic growth. Balanced approaches prepare students for complex challenges.",
                consequences: [
                    "Environmental education increases awareness but may reduce focus on economic skills.",
                    "Industrial history can inspire ambition but risk neglecting sustainability.",
                    "Critical thinking and resilience foster adaptability but require teacher training."
                ],
                conclusion: "A well-designed curriculum balances environmental, economic, and civic priorities for future generations.",
                attribution: "References: UNESCO, OECD, National Geographic, 2022."
            }
        },
        // ç¬¬ä¸ƒå¹´å¤§äº‹ä»¶
        {
            id: 7,
            year: 7,
            title: "Marine Animal Management",
            description: "Debates have emerged about how your city should manage marine wildlife as development continues.",
            options: [
                {
                    id: "A",
                    text: "Designate a large offshore area as a marine protected zone.",
                    effectsDisplay: "Fisher +10 Credit.",
                    effects: { industrialStance: 0, ecologicalStance: 20 },
                    additionalDeck: ""
                },
                {
                    id: "B",
                    text: "Open a wild marine animal zoo for education and entertainment.",
                    effectsDisplay: "Educator +10 Credit.",
                    effects: { industrialStance: 15, ecologicalStance: 5 },
                    additionalDeck: "7B"
                },
                {
                    id: "C",
                    text: "Establish a marine animal research and monitoring center.",
                    effectsDisplay: "Scientist +10 Credit.",
                    effects: { industrialStance: 10, ecologicalStance: 10 },
                    additionalDeck: ""
                }
            ],
            factContent: {
                title: "Real Story: Marine Wildlife Management Dilemmas",
                introduction: "Cities worldwide face tough choices in marine animal management. Australia's Great Barrier Reef Marine Park is a vast protected zone, while places like Dubai have built marine zoos and aquariums for tourism. Research centers, such as the Monterey Bay Aquarium Research Institute, focus on monitoring and conservation.",
                impact: "Marine protected areas can restore ecosystems but may limit fishing. Marine zoos offer education and entertainment but face ethical debates. Research centers advance science but require sustained funding.",
                consequences: [
                    "Protected zones can boost biodiversity but may reduce local fishery income.",
                    "Marine zoos attract visitors but may draw criticism from animal rights groups.",
                    "Research centers improve knowledge but depend on public and private support."
                ],
                conclusion: "Balancing conservation, economic interests, and public education is a challenge for coastal cities worldwide.",
                attribution: "References: UNESCO, National Geographic, MBARI, 2023."
            },
            // è”åŠ¨é”å®šé€»è¾‘ï¼šç”±ç¬¬å››å¹´é€‰é¡¹å†³å®šå“ªäº›é€‰é¡¹å¯é€‰
            lockByYear4: true
        },
        // ç¬¬å…«å¹´å¤§äº‹ä»¶
        {
            id: 8,
            year: 8,
            title: "City Celebration",
            description: "Your city is planning a large-scale public event to showcase its growth. What theme will the event have?",
            options: [
                {
                    id: "A",
                    text: "Host a high-tech exhibition focused on innovation and new advancements across industries.",
                    effectsDisplay: "Business Owner +5 Credit, Influencer +5 Credit, Politician +5 Credit, Scientist +10 Credit.",
                    effects: { industrialStance: 20, ecologicalStance: 5 },
                    additionalDeck: 0
                },
                {
                    id: "B",
                    text: "Celebrate marine culture with a local seafood and ocean-themed expo.",
                    effectsDisplay: "Business Owner +5 Credit, Influencer +5 Credit, Politician +5 Credit, Fisher +10 Credit.",
                    effects: { industrialStance: 5, ecologicalStance: 20 },
                    additionalDeck: 0
                },
                {
                    id: "C",
                    text: "Organize a city-wide arts and culture festival with community engagement.",
                    effectsDisplay: "Business Owner +5 Credit, Influencer +5 Credit, Politician +5 Credit, Educator +10 Credit.",
                    effects: { industrialStance: 10, ecologicalStance: 0 },
                    additionalDeck: 0
                }
            ],
            factContent: {
                title: "Real Story: City Festivals and Their Impact",
                introduction: "Cities around the world use public events to boost civic pride and economic growth. Shanghai's World Expo 2010 focused on innovation and drew millions of visitors. The Galway International Oyster & Seafood Festival in Ireland celebrates marine culture. Edinburgh's Fringe Festival is a global arts event that brings communities together.",
                impact: "High-tech expos promote industry and attract investment. Marine festivals highlight local heritage and sustainability. Arts festivals foster creativity and social bonds.",
                consequences: [
                    "Tech expos can accelerate urban development but may overshadow local culture.",
                    "Marine expos support fisheries and tourism but require careful resource management.",
                    "Arts festivals build community but need broad participation and funding."
                ],
                conclusion: "A city's choice of celebration theme shapes its image, economy, and sense of belonging.",
                attribution: "References: BBC, National Geographic, The Guardian, 2023."
            }
        },
        // ç¬¬ä¹å¹´å¤§äº‹ä»¶
        {
            id: 9,
            year: 9,
            title: "Tsunami and Rebuilding",
            description: "After experiencing a destructive tsunami, your city must make critical decisions about reconstruction.",
            options: [
                {
                    id: "A",
                    text: "Launch a rapid reconstruction campaign to restore heavily affected regions.",
                    effectsDisplay: "Business Owner -15 Credit, Politician â€“15 Credit, all others â€“5 Credit.",
                    effects: { industrialStance: 20, ecologicalStance: 0 },
                    additionalDeck: ""
                },
                {
                    id: "B",
                    text: "Evacuate residents from high-risk coastal areas and convert the coastline into a natural ecological buffer.",
                    effectsDisplay: "All players â€“20 Credit.",
                    effects: { industrialStance: 0, ecologicalStance: 20 },
                    additionalDeck: ""
                },
                {
                    id: "C",
                    text: "Delay rebuilding due to funding and conflict. Reconstruction slows, but no clear plan emerges.",
                    effectsDisplay: "Business Owner â€“20 Credit, Politician â€“20 Credit, all others â€“5 Credit.",
                    effects: { industrialStance: -30, ecologicalStance: -30 },
                    additionalDeck: "9C"
                }
            ],
            factContent: {
                title: "Real Story: Tsunami Recovery and Urban Choices",
                introduction: "After the 2011 TÅhoku earthquake and tsunami, Japanese cities faced tough decisions on rebuilding. Some areas rebuilt quickly, while others created new ecological buffer zones. Delays in funding and planning left some communities in limbo for years.",
                impact: "Rapid reconstruction restores livelihoods but can risk future safety. Ecological buffers protect against future disasters but disrupt communities. Delays in planning can erode trust and slow recovery.",
                consequences: [
                    "Quick rebuilding can boost morale but may ignore long-term risks.",
                    "Ecological buffers reduce disaster risk but disrupt communities.",
                    "Delays in planning can erode trust and slow recovery."
                ],
                conclusion: "Balancing speed, safety, and sustainability is key to disaster recovery.",
                attribution: "References: The Japan Times, BBC, National Geographic, 2023."
            },
            // è”åŠ¨é”å®šé€»è¾‘ï¼šç”±ç¬¬äº”å¹´é€‰é¡¹å†³å®šå“ªäº›é€‰é¡¹å¯é€‰
            lockByYear5: true
        },
        // ç¬¬åå¹´å¤§äº‹ä»¶
        {
            id: 10,
            year: 10,
            title: "Neighbor City Collaboration",
            description: "A neighboring city proposes a partnership. How should you approach the collaboration?",
            options: [
                {
                    id: "A",
                    text: "Join forces on industrial development and shared infrastructure.",
                    effectsDisplay: "Business Owner +10 Credit, Politician +10 Credit, Influencer +10 Credit.",
                    effects: { industrialStance: 20, ecologicalStance: 0 },
                    additionalDeck: 0
                },
                {
                    id: "B",
                    text: "Form a coastal environmental alliance for joint marine protection.",
                    effectsDisplay: "Fisher +10 Credit, Educator +10 Credit, Scientist +10 Credit.",
                    effects: { industrialStance: 0, ecologicalStance: 20 },
                    additionalDeck: 0
                },
                {
                    id: "C",
                    text: "Accept only limited trade cooperation and maintain full independence.",
                    effectsDisplay: "All players +5 Credit.",
                    effects: { industrialStance: 10, ecologicalStance: 10 },
                    additionalDeck: 0
                }
            ],
            factContent: {
                title: "Real Story: City Partnerships and Regional Alliances",
                introduction: "Cities worldwide form partnerships for economic growth and environmental protection. The Ã˜resund Region unites Copenhagen and MalmÃ¶ for shared infrastructure. The Coral Triangle Initiative is a multi-country marine alliance. Some cities, like Singapore, maintain independence while trading globally.",
                impact: "Joint development boosts resources but may create dependency. Environmental alliances protect ecosystems but require compromise. Independence preserves autonomy but can limit influence.",
                consequences: [
                    "Industrial partnerships can drive growth but risk overdevelopment.",
                    "Marine alliances improve conservation but need trust and coordination.",
                    "Independence offers control but may miss regional opportunities."
                ],
                conclusion: "The right approach depends on a city's values, needs, and vision for the future.",
                attribution: "References: The Guardian, National Geographic, World Economic Forum, 2023."
            },
            // è”åŠ¨é”å®šé€»è¾‘ï¼šç”±ç¬¬äº”å¹´é€‰é¡¹å†³å®šå“ªäº›é€‰é¡¹å¯é€‰
            lockByYear5: true
        }
    ];

    // Initialize the game
    initializeGame();

    function initializeGame() {
        const gameContainer = document.getElementById('game-container');
        
        // Add ocean background
        const oceanBackground = createOceanBackground();
        gameContainer.appendChild(oceanBackground);
        
        // Add game version
        const gameVersion = document.createElement('div');
        gameVersion.className = 'game-version';
        gameVersion.textContent = 'Ocean of Possibilities v1.0';
        gameContainer.appendChild(gameVersion);
        
        // Render start screen
        renderScreen('start');
        
        // Set animation active after a brief delay
        setTimeout(() => {
            gameState.animationActive = true;
            const currentScreen = document.querySelector('.screen');
            if (currentScreen) {
                currentScreen.classList.remove('inactive');
            }
        }, 100);
    }

    function createOceanBackground() {
        const background = document.createElement('div');
        background.className = 'ocean-wave-bg';
        
        const wave = document.createElement('div');
        wave.className = 'wave';
        
        background.appendChild(wave);
        return background;
    }

    function renderScreen(screenName) {
        gameState.currentScreen = screenName;
        const gameContainer = document.getElementById('game-container');
        
        // Clear existing content except background
        const existingScreen = document.querySelector('.screen');
        if (existingScreen) {
            gameContainer.removeChild(existingScreen);
        }
        
        // Remove any existing modal
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) {
            gameContainer.removeChild(existingModal);
        }
        
        // Create new screen element
        const screenElement = document.createElement('div');
        screenElement.className = 'screen inactive';
        
        // ä¸ºç‰¹å®šé¡µé¢æ·»åŠ å±…ä¸­ç±»
        if (screenName === 'start' || screenName === 'character-select' || screenName === 'event-draw' || screenName === 'record-event-card-draw') {
            screenElement.classList.add('screen-centered');
        }
        
        // Render appropriate content based on screen name
        switch (screenName) {
            case 'start':
                renderStartScreen(screenElement);
                break;
            case 'character-select':
                renderCharacterSelectScreen(screenElement);
                break;
            case 'background':
                renderBackgroundStoryScreen(screenElement);
                break;
            case 'main-game':
                renderMainGameScreen(screenElement);
                break;
            case 'fact-view':
                renderFactViewScreen(screenElement);
                break;
            case 'record-event-card-draw':
                renderRecordEventCardDrawScreen(screenElement);
                break;
            default:
                renderStartScreen(screenElement);
        }
        
        gameContainer.appendChild(screenElement);
        
        // Activate animation after a short delay
        setTimeout(() => {
            screenElement.classList.remove('inactive');
        }, 50);
    }

    function renderStartScreen(screenElement) {
        // è®¾ç½®å®¹å™¨æ ·å¼ä¾¿äºŽå®šä½å’ŒåŠ¨ç”»
        screenElement.style.position = 'relative';
        screenElement.style.overflow = 'hidden';
        
        // åˆ›å»ºèƒŒæ™¯æ³¢æµªåŠ¨ç”»æ•ˆæžœ
        const backgroundWaves = document.createElement('div');
        backgroundWaves.className = 'background-waves';
        backgroundWaves.style.position = 'absolute';
        backgroundWaves.style.bottom = '0';
        backgroundWaves.style.left = '0';
        backgroundWaves.style.width = '100%';
        backgroundWaves.style.height = '40%';
        backgroundWaves.style.background = 'linear-gradient(0deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0) 100%)';
        backgroundWaves.style.opacity = '0';
        backgroundWaves.style.transition = 'opacity 2.5s ease-in-out';
        
        // å†…å®¹å®¹å™¨ - ç”¨äºŽæŽ§åˆ¶å…ƒç´ å±…ä¸­
        const contentContainer = document.createElement('div');
        contentContainer.style.position = 'relative';
        contentContainer.style.zIndex = '10';
        contentContainer.style.display = 'flex';
        contentContainer.style.flexDirection = 'column';
        contentContainer.style.alignItems = 'center';
        contentContainer.style.justifyContent = 'center';
        contentContainer.style.padding = '0 2rem';
        contentContainer.style.maxWidth = '800px';
        contentContainer.style.margin = '0 auto';
        contentContainer.style.height = '100%';
        contentContainer.style.paddingTop = '1rem'; // ä¸ºlogoæ·»åŠ ä¸Šéƒ¨ç©ºé—´
        
        // åˆ›å»ºlogoå®¹å™¨
        const logoContainer = document.createElement('div');
        logoContainer.style.marginBottom = '2.5rem';
        logoContainer.style.opacity = '0';
        logoContainer.style.transform = 'translateY(30px) scale(0.95)';
        logoContainer.style.transition = 'opacity 1.8s ease-out, transform 1.8s ease-out';
        logoContainer.style.display = 'flex';
        logoContainer.style.justifyContent = 'center';
        logoContainer.style.width = '100%';
        
        // æ·»åŠ logo
        const logo = document.createElement('div');
        logo.innerHTML = `<img src="logo.svg" alt="Ocean of Possibilities Logo" style="width: 180px; height: 180px; filter: drop-shadow(0 4px 8px rgba(99, 164, 245, 0.3));">`;
        logo.style.animation = 'floating 6s ease-in-out infinite';
        
        // æ·»åŠ logoæµ®åŠ¨åŠ¨ç”»
        const floatKeyframes = `
        @keyframes floating {
            0% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
            100% { transform: translateY(0); }
        }`;
        
        const floatStyle = document.createElement('style');
        floatStyle.textContent = floatKeyframes;
        document.head.appendChild(floatStyle);
        
        logoContainer.appendChild(logo);
        
        // æ ‡é¢˜å®¹å™¨ - ä¸ºæ ‡é¢˜ç‰¹æ•ˆå‡†å¤‡
        const titleContainer = document.createElement('div');
        titleContainer.style.position = 'relative';
        titleContainer.style.marginBottom = '2rem';
        titleContainer.style.opacity = '0';
        titleContainer.style.transform = 'translateY(40px)';
        titleContainer.style.transition = 'opacity 1.5s ease-out, transform 1.5s ease-out';
        titleContainer.style.transitionDelay = '0.3s'; // å»¶è¿Ÿäº†æ ‡é¢˜åŠ¨ç”»ï¼Œå…ˆæ˜¾ç¤ºlogo
        
        // æ ‡é¢˜
        const title = document.createElement('h1');
        title.textContent = 'Ocean of Possibilities';
        title.style.fontSize = '3.5rem';
        title.style.fontWeight = '300';
        title.style.color = '#2563EB';
        title.style.textAlign = 'center';
        title.style.marginBottom = '1rem';
        title.style.position = 'relative';
        
        // æ ‡é¢˜è£…é¥°çº¿
        const titleDecoration = document.createElement('div');
        titleDecoration.style.position = 'absolute';
        titleDecoration.style.bottom = '-0.5rem';
        titleDecoration.style.left = '50%';
        titleDecoration.style.width = '0';
        titleDecoration.style.height = '4px';
        titleDecoration.style.backgroundColor = '#60A5FA';
        titleDecoration.style.transform = 'translateX(-50%)';
        titleDecoration.style.transition = 'width 1.8s ease-in-out';
        titleDecoration.style.borderRadius = '2px';
        
        // å°†æ ‡é¢˜å’Œè£…é¥°çº¿æ·»åŠ åˆ°æ ‡é¢˜å®¹å™¨
        titleContainer.appendChild(title);
        titleContainer.appendChild(titleDecoration);
        
        // æè¿°
        const description = document.createElement('p');
        description.className = 'subtitle';
        description.textContent = 'Explore the balance between ocean conservation and sustainable development in this interactive decision-making adventure';
        description.style.fontSize = '1.25rem';
        description.style.textAlign = 'center';
        description.style.color = '#4B5563';
        description.style.lineHeight = '1.7';
        description.style.maxWidth = '700px';
        description.style.opacity = '0';
        description.style.transform = 'translateY(30px)';
        description.style.transition = 'opacity 1.5s ease-out, transform 1.5s ease-out';
        description.style.transitionDelay = '0.7s'; // è°ƒæ•´å»¶è¿Ÿæ—¶é—´
        
        // æŒ‰é’®å®¹å™¨
        const buttonContainer = document.createElement('div');
        buttonContainer.style.marginTop = '3rem';
        buttonContainer.style.opacity = '0';
        buttonContainer.style.transform = 'translateY(30px)';
        buttonContainer.style.transition = 'opacity 1.5s ease-out, transform 1.5s ease-out';
        buttonContainer.style.transitionDelay = '1.2s'; // è°ƒæ•´å»¶è¿Ÿæ—¶é—´
        
        // å¼€å§‹æŒ‰é’®
        const startButton = document.createElement('button');
        startButton.className = 'btn btn-primary btn-large';
        startButton.textContent = 'START ADVENTURE';
        startButton.style.minWidth = '200px';
        startButton.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';

        // ç®€åŒ–æŒ‰é’®æ‚¬åœæ•ˆæžœ - ä¸Žå…¶ä»–æŒ‰é’®ä¿æŒä¸€è‡´
        startButton.addEventListener('mouseover', () => {
            startButton.style.transform = 'translateY(-3px)';
            startButton.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        });

        startButton.addEventListener('mouseout', () => {
            startButton.style.transform = 'translateY(0)';
            startButton.style.boxShadow = 'none';
        });

        // ç®€åŒ–æŒ‰é’®ç‚¹å‡»æ•ˆæžœ
        startButton.addEventListener('mousedown', () => {
            startButton.style.transform = 'scale(0.98)';
        });

        startButton.addEventListener('mouseup', () => {
            startButton.style.transform = 'scale(1)';
        });

        startButton.addEventListener('click', () => {
            // é€€å‡ºåŠ¨ç”»
            logoContainer.style.opacity = '0';
            logoContainer.style.transform = 'translateY(-40px) scale(0.9)';
            
            titleContainer.style.opacity = '0';
            titleContainer.style.transform = 'translateY(-40px)';
            
            description.style.opacity = '0';
            description.style.transform = 'translateY(-30px)';
            
            buttonContainer.style.opacity = '0';
            buttonContainer.style.transform = 'translateY(-30px)';
            
            backgroundWaves.style.opacity = '0';
            
            // ç®€åŒ–é€€å‡ºæ•ˆæžœ
            setTimeout(() => {
                transitionToScreen('character-select');
            }, 800);
        });
        
        // æ·»åŠ æµ·æ´‹æµ®åŠ¨ç²’å­æ•ˆæžœ
        const particlesContainer = document.createElement('div');
        particlesContainer.style.position = 'absolute';
        particlesContainer.style.inset = '0';
        particlesContainer.style.pointerEvents = 'none';
        particlesContainer.style.zIndex = '1';
        particlesContainer.style.opacity = '0';
        particlesContainer.style.transition = 'opacity 3s ease-in-out';
        
        // åˆ›å»º15ä¸ªæµ®åŠ¨ç²’å­
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.width = `${Math.random() * 10 + 5}px`;
            particle.style.height = particle.style.width;
            particle.style.borderRadius = '50%';
            particle.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
            particle.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.3)';
            
            // è®¾ç½®åŠ¨ç”»
            const duration = Math.random() * 10 + 15;
            const xMovement = Math.random() * 100 - 50;
            const yMovement = Math.random() * 100 - 50;
            
            particle.style.animation = `float ${duration}s infinite ease-in-out`;
            
            // åˆ›å»ºå…³é”®å¸§åŠ¨ç”»
            const keyframes = `
            @keyframes float {
                0% {
                    transform: translate(0, 0);
                }
                50% {
                    transform: translate(${xMovement}px, ${yMovement}px);
                }
                100% {
                    transform: translate(0, 0);
                }
            }`;
            
            // æ·»åŠ æ ·å¼æ ‡ç­¾
            const style = document.createElement('style');
            style.textContent = keyframes;
            document.head.appendChild(style);
            
            particlesContainer.appendChild(particle);
        }
        
        // å°†æŒ‰é’®æ·»åŠ åˆ°æŒ‰é’®å®¹å™¨
        buttonContainer.appendChild(startButton);
        
        // å°†æ‰€æœ‰å…ƒç´ æ·»åŠ åˆ°å†…å®¹å®¹å™¨
        contentContainer.appendChild(logoContainer);
        contentContainer.appendChild(titleContainer);
        contentContainer.appendChild(description);
        contentContainer.appendChild(buttonContainer);
        
        // å°†å†…å®¹å®¹å™¨æ·»åŠ åˆ°å±å¹•å…ƒç´ 
        screenElement.appendChild(particlesContainer);
        screenElement.appendChild(backgroundWaves);
        screenElement.appendChild(contentContainer);
        
        // è§¦å‘åŠ¨ç”»åºåˆ—
        setTimeout(() => {
            backgroundWaves.style.opacity = '1';
            particlesContainer.style.opacity = '1';
            
            setTimeout(() => {
                logoContainer.style.opacity = '1';
                logoContainer.style.transform = 'translateY(0) scale(1)';
            
            setTimeout(() => {
                titleContainer.style.opacity = '1';
                titleContainer.style.transform = 'translateY(0)';
                
                // æ ‡é¢˜è£…é¥°çº¿å»¶è¿Ÿå±•å¼€
                setTimeout(() => {
                    titleDecoration.style.width = '70%';
                    
                    setTimeout(() => {
                        description.style.opacity = '1';
                        description.style.transform = 'translateY(0)';
                        
                        setTimeout(() => {
                            buttonContainer.style.opacity = '1';
                            buttonContainer.style.transform = 'translateY(0)';
                            }, 500);
                        }, 500);
                }, 800);
                }, 500);
            }, 500);
        }, 300);

        applyModernButtonStyle(startButton, {disabled: false});
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'center';
        buttonContainer.style.marginTop = '3rem';
    }

    function renderCharacterSelectScreen(screenElement) {
        // Title
        const title = document.createElement('h1');
        title.textContent = 'Selecting Participating Occupations';
        
        // Character grid
        const characterGrid = document.createElement('div');
        characterGrid.className = 'character-grid';
        characterGrid.style.maxWidth = '1200px';
        characterGrid.style.margin = '2rem auto';
        characterGrid.style.padding = '0 1rem';
        
        // Add character cards
        characters.forEach(character => {
            const isSelected = gameState.selectedCharacters.includes(character.id);
            const characterCard = createCharacterCard(character, isSelected);
            characterGrid.appendChild(characterCard);
        });
        
        // Continue button container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.textAlign = 'center';
        buttonContainer.style.marginTop = '2rem';
        
        // Continue button
        const continueButton = document.createElement('button');
        continueButton.textContent = 'CONTINUE';
        continueButton.className = gameState.selectedCharacters.length >= 4
            ? 'btn btn-primary btn-medium continue-button' 
            : 'btn btn-disabled btn-medium continue-button';
        
        if (gameState.selectedCharacters.length >= 4) {
            continueButton.addEventListener('click', () => {
                transitionToScreen('background');
            });
        }
        
        buttonContainer.appendChild(continueButton);
        
        // Append elements to screen
        screenElement.appendChild(title);
        screenElement.appendChild(characterGrid);
        screenElement.appendChild(buttonContainer);
    }

    function createCharacterCard(character, isSelected) {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.dataset.characterId = character.id;
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.alignItems = 'center';
        card.style.padding = '1rem';
        
        // Character name
        const name = document.createElement('div');
        name.className = 'character-name';
        name.textContent = character.name;
        name.style.fontSize = '1.2rem';
        name.style.marginBottom = '1rem';
        
        // å¤–åœˆ
        const iconOuter = document.createElement('div');
        iconOuter.style.width = '100px';
        iconOuter.style.height = '100px';
        iconOuter.style.borderRadius = '50%';
        iconOuter.style.backgroundColor = isSelected ? '#3B82F6' : '#DBEAFE';
        iconOuter.style.display = 'flex';
        iconOuter.style.justifyContent = 'center';
        iconOuter.style.alignItems = 'center';
        iconOuter.style.marginBottom = '1rem';
        iconOuter.style.transition = 'background 0.3s, box-shadow 0.3s, transform 0.3s';
        iconOuter.style.boxShadow = '0 4px 16px 0 rgba(59,130,246,0.10)';
        iconOuter.style.cursor = 'pointer';

        // æ‚¬åœæµ®èµ·åŠ¨ç”»
        iconOuter.addEventListener('mouseover', () => {
            iconOuter.style.transform = 'translateY(-6px) scale(1.06)';
            iconOuter.style.boxShadow = '0 8px 24px 0 rgba(59,130,246,0.18)';
        });
        iconOuter.addEventListener('mouseout', () => {
            iconOuter.style.transform = 'none';
            iconOuter.style.boxShadow = '0 4px 16px 0 rgba(59,130,246,0.10)';
        });
        
        // Character icon
        const icon = document.createElement('div');
        icon.className = 'character-icon';
        icon.style.width = '80px';
        icon.style.height = '80px';
        icon.style.borderRadius = '50%';
        icon.style.display = 'flex';
        icon.style.justifyContent = 'center';
        icon.style.alignItems = 'center';
        icon.style.color = isSelected ? 'white' : '#1E40AF';
        icon.style.overflow = 'hidden';
        icon.style.marginTop = '10px'; // ä¸‹ç§»10px
        if (SVG_ICONS[character.id]) {
            icon.innerHTML = SVG_ICONS[character.id];
            const svg = icon.querySelector('svg');
            if (svg) {
                svg.setAttribute('width', '100%');
                svg.setAttribute('height', '100%');
                svg.style.display = 'block';
                svg.style.margin = '0';
            }
        } else {
        icon.textContent = character.icon;
        }
        iconOuter.appendChild(icon);
        
        // ç‚¹å‡»äº‹ä»¶
        iconOuter.addEventListener('click', () => {
            toggleCharacterSelection(character.id);
        });
        
        // Selection button
        const button = document.createElement('button');
        button.className = isSelected ? 'btn btn-primary btn-small' : 'btn btn-secondary btn-small';
        button.textContent = isSelected ? 'SELECTED' : 'SELECT';
        button.style.minWidth = '100px';
        
        button.addEventListener('click', () => {
            toggleCharacterSelection(character.id);
        });
        
        // Append elements to card
        card.appendChild(name);
        card.appendChild(iconOuter);
        card.appendChild(button);
        
        return card;
    }

    function toggleCharacterSelection(characterId) {
        if (gameState.selectedCharacters.includes(characterId)) {
            // Remove character if already selected
            gameState.selectedCharacters = gameState.selectedCharacters.filter(id => id !== characterId);
        } else {
            // Add character if not selected
            gameState.selectedCharacters.push(characterId);
        }
        
        // æ›´æ–°UIè€Œä¸æ˜¯é‡æ–°æ¸²æŸ“æ•´ä¸ªå±å¹•
        updateCharacterSelectionUI(characterId);
        updateContinueButton();
    }

    // æ›´æ–°é€‰æ‹©UIå‡½æ•°
    function updateCharacterSelectionUI(characterId) {
        const character = characters.find(char => char.id === characterId);
        const isSelected = gameState.selectedCharacters.includes(characterId);
        
        // ä½¿ç”¨æ›´å¯é çš„æ•°æ®å±žæ€§é€‰æ‹©å™¨
        const characterCard = document.querySelector(`[data-character-id="${characterId}"]`);
        if (!characterCard) return;
        
        // æ›´æ–°å›¾æ ‡é¢œè‰²
        const icon = characterCard.querySelector('.character-icon');
        if (icon) {
            icon.style.backgroundColor = isSelected ? '#3B82F6' : '#DBEAFE';
            icon.style.color = isSelected ? 'white' : '#1E40AF';
        }
        
        // æ›´æ–°æŒ‰é’®æ–‡æœ¬å’Œæ ·å¼
        const button = characterCard.querySelector('.btn');
        if (button) {
            button.textContent = isSelected ? 'SELECTED' : 'SELECT';
            button.className = isSelected ? 'btn btn-primary btn-small' : 'btn btn-secondary btn-small';
        }
    }

    // æ›´æ–°ç»§ç»­æŒ‰é’®çŠ¶æ€å‡½æ•°
    function updateContinueButton() {
        const canContinue = gameState.selectedCharacters.length >= 4;
        const continueButton = document.querySelector('.continue-button');
        
        if (continueButton) {
            if (canContinue) {
                continueButton.className = 'btn btn-primary btn-medium continue-button';
                continueButton.disabled = false;
                // ä½¿ç”¨äº‹ä»¶ç›‘å¬å™¨æ›¿ä»£ç›´æŽ¥è®¾ç½®onclick
                continueButton.onclick = null;
                if (!continueButton._hasClickListener) {
                    continueButton.addEventListener('click', () => {
                        transitionToScreen('background');
                    });
                    continueButton._hasClickListener = true;
                }
            } else {
                continueButton.className = 'btn btn-disabled btn-medium continue-button';
                continueButton.disabled = true;
            }
        }
    }

    function renderBackgroundStoryScreen(screenElement) {
        // æ·»åŠ å¤–å±‚å®¹å™¨
        const outerContainer = document.createElement('div');
        outerContainer.style.display = 'flex';
        outerContainer.style.flexDirection = 'column';
        outerContainer.style.minHeight = '100vh';
        outerContainer.style.justifyContent = 'center';
        outerContainer.style.padding = '2rem 0';
        screenElement.appendChild(outerContainer);

        // Selected characters icons bar
        const iconsBar = document.createElement('div');
        iconsBar.className = 'selected-characters-bar';
        iconsBar.style.display = 'flex';
        iconsBar.style.justifyContent = 'center';
        iconsBar.style.gap = '2.5rem';
        iconsBar.style.padding = '1.5rem 0 2.5rem 0';
        iconsBar.style.marginBottom = '2rem';
        iconsBar.style.background = 'none';
        iconsBar.style.border = 'none';
        iconsBar.style.backdropFilter = 'none';
        
        // Add selected character icons
        gameState.selectedCharacters.forEach(charId => {
            const character = characters.find(c => c.id === charId);
            const iconContainer = document.createElement('div');
            iconContainer.className = 'character-icon-small';
            iconContainer.style.width = '80px';
            iconContainer.style.height = '80px';
            iconContainer.style.borderRadius = '50%';
            iconContainer.style.backgroundColor = '#DBEAFE';
            iconContainer.style.display = 'flex';
            iconContainer.style.justifyContent = 'center';
            iconContainer.style.alignItems = 'center';
            iconContainer.style.boxShadow = 'none';
            iconContainer.style.transition = 'transform 0.3s ease';
            if (SVG_ICONS[character.id]) {
                iconContainer.innerHTML = SVG_ICONS[character.id].replace(/width="60"/g,'width="60"').replace(/height="60"/g,'height="60"');
            } else {
            iconContainer.textContent = character.icon;
                iconContainer.style.fontSize = '3.5rem';
            }
            iconsBar.appendChild(iconContainer);
        });
        
        // Create story container
        const storyContainer = document.createElement('div');
        storyContainer.className = 'story-container';
        storyContainer.style.maxWidth = '800px';
        storyContainer.style.margin = '0 auto';
        storyContainer.style.padding = '0 1rem';
        
        // Title
        const title = document.createElement('h1');
        title.textContent = 'The New Coastal City Initiative';
        title.style.textAlign = 'center';
        title.style.marginBottom = '2rem';
        
        // Story content
        const content = document.createElement('div');
        content.className = 'story-content';
        content.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        content.style.padding = '2rem';
        content.style.borderRadius = '1rem';
        content.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        
        // Get selected character names for story
        const selectedCharacterNames = characters
            .filter(char => gameState.selectedCharacters.includes(char.id))
            .map(char => char.name);
        
        const characterList = selectedCharacterNames.slice(0, -1).join(', ') + 
            (selectedCharacterNames.length > 1 ? ', and ' : '') + 
            selectedCharacterNames[selectedCharacterNames.length - 1];
        
        // Story paragraphs
        const paragraph1 = document.createElement('p');
        paragraph1.className = 'story-paragraph';
        paragraph1.innerHTML = '<strong style="font-size:1.25rem;color:#2563EB;">In a bold move to secure the future, your country has announced the founding of a new seaside city.</strong>';
        paragraph1.style.opacity = '0';
        paragraph1.style.transform = 'translateY(20px)';
        paragraph1.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        
        const paragraph2 = document.createElement('p');
        paragraph2.className = 'story-paragraph';
        paragraph2.textContent = `You are part of a selected team: a ${characterList}. Together, you have accepted the task â€” not just to build, but to guide a city through the uncertain tides of the future.`;
        paragraph2.style.opacity = '0';
        paragraph2.style.transform = 'translateY(20px)';
        paragraph2.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        
        const paragraph3 = document.createElement('p');
        paragraph3.className = 'story-paragraph';
        paragraph3.textContent = 'Now, you have arrived in this untamed place, ready to lead its first steps into history.';
        paragraph3.style.opacity = '0';
        paragraph3.style.transform = 'translateY(20px)';
        paragraph3.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        
        content.appendChild(paragraph1);
        content.appendChild(paragraph2);
        content.appendChild(paragraph3);
        
        // Begin button container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.textAlign = 'center';
        buttonContainer.style.marginTop = '3rem';
        buttonContainer.style.opacity = '0';
        buttonContainer.style.transition = 'opacity 0.8s ease';
        
        // Begin button
        const beginButton = document.createElement('button');
        beginButton.className = 'btn btn-primary btn-large';
        beginButton.textContent = 'Begin Adventure';
        beginButton.addEventListener('click', () => {
            transitionToScreen('main-game');
        });
        applyModernButtonStyle(beginButton, {disabled: false});
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'center';
        buttonContainer.style.marginTop = '3rem';
        
        buttonContainer.appendChild(beginButton);
        
        // Append elements to story container
        storyContainer.appendChild(title);
        storyContainer.appendChild(content);
        storyContainer.appendChild(buttonContainer);
        
        // å°†æ‰€æœ‰å†…å®¹æ·»åŠ åˆ°å¤–å±‚å®¹å™¨
        outerContainer.appendChild(iconsBar);
        outerContainer.appendChild(storyContainer);
        
        // é€æ®µæ˜¾ç¤ºæ–‡å­—çš„åŠ¨ç”»æ•ˆæžœ
        setTimeout(() => {
            paragraph1.style.opacity = '1';
            paragraph1.style.transform = 'translateY(0)';
            
            setTimeout(() => {
                paragraph2.style.opacity = '1';
                paragraph2.style.transform = 'translateY(0)';
                
                setTimeout(() => {
                    paragraph3.style.opacity = '1';
                    paragraph3.style.transform = 'translateY(0)';
                    
                    // æœ€åŽæ˜¾ç¤ºæŒ‰é’®
                    setTimeout(() => {
                        buttonContainer.style.opacity = '1';
                    }, 800);
                    
                }, 1200);
            }, 1200);
        }, 500);
    }

    function renderMainGameScreen(screenElement) {
        // Initialize current event if not set
        if (!gameState.currentEvent) {
            gameState.currentEvent = eventsData.find(e => e.year === gameState.gameMetrics.year);
        }
        
        // å†…å®¹å®¹å™¨
        const contentContainer = document.createElement('div');
        contentContainer.style.maxWidth = '900px';
        contentContainer.style.margin = '0 auto';
        contentContainer.style.padding = '0 1rem';
        
        // è®¡ç®—æŒ‡æ ‡å€¼
        const industrialPosition = gameState.gameMetrics.industrialStance;
        const ecologicalPosition = gameState.gameMetrics.ecologicalStance;
        const timelinePosition = (gameState.gameMetrics.year / 10) * 100;
        
        // è¿›åº¦æ¡æ˜ å°„ï¼š0-100%åªå barçš„0-50%ï¼Œ50%åªåˆ°1/4ï¼Œ100%åˆ°ä¸­çº¿
        // 0-100% -> 0-50%å®½åº¦
        function stanceToBarWidth(val) {
            return Math.max(0, Math.min(100, val)) * 0.5;
        }

        // æ¸¸æˆç»“æŸæ£€æµ‹
        if (industrialPosition >= 100 || ecologicalPosition >= 100) {
            setTimeout(() => {
                showGameOverModal();
            }, 300);
            return;
        }
        
        // æŒ‡æ ‡å®¹å™¨ - æ¢å¤åŽŸè®¾è®¡ä½†å¢žåŠ åŠ¨ç”»
        const metricsContainer = document.createElement('div');
        metricsContainer.className = 'metrics-container';
        metricsContainer.style.marginBottom = '2rem';
        metricsContainer.style.width = '100%';
        
        // å·¥ä¸š/ç”Ÿæ€ç«‹åœºåŒºåŸŸ
        const stanceContainer = document.createElement('div');
        stanceContainer.style.marginBottom = '1.5rem';
        
        // æ ‡ç­¾å®¹å™¨
        const stanceLabel = document.createElement('div');
        stanceLabel.className = 'metrics-label';
        stanceLabel.style.display = 'flex';
        stanceLabel.style.justifyContent = 'space-between';
        stanceLabel.style.marginBottom = '0.5rem';
        
        // å·¦ä¾§æ ‡ç­¾ - å·¥ä¸š
        const industrialLabel = document.createElement('span');
        industrialLabel.textContent = 'Industrial Stance';
        industrialLabel.style.fontWeight = '500';
        industrialLabel.style.color = '#4B5563';
        
        // å³ä¾§æ ‡ç­¾ - ç”Ÿæ€
        const ecologicalLabel = document.createElement('span');
        ecologicalLabel.textContent = 'Ecological Stance';
        ecologicalLabel.style.fontWeight = '500';
        ecologicalLabel.style.color = '#4B5563';
        
        stanceLabel.appendChild(industrialLabel);
        stanceLabel.appendChild(ecologicalLabel);
        
        // è¿›åº¦æ¡å®¹å™¨
        const stanceBar = document.createElement('div');
        stanceBar.className = 'metrics-bar';
        stanceBar.style.position = 'relative';
        stanceBar.style.height = '2rem';
        stanceBar.style.backgroundColor = '#F3F4F6';
        stanceBar.style.borderRadius = '9999px';
        stanceBar.style.overflow = 'hidden';
        stanceBar.style.border = '1px solid #D1D5DB';
        stanceBar.style.boxShadow = 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)';
        
        // ä¸­å¿ƒçº¿
        const centerLine = document.createElement('div');
        centerLine.className = 'metrics-bar-center';
        centerLine.style.position = 'absolute';
        centerLine.style.height = '100%';
        centerLine.style.width = '0.125rem';
        centerLine.style.backgroundColor = '#D1D5DB';
        centerLine.style.left = '50%';
        centerLine.style.transform = 'translateX(-50%)';
        centerLine.style.zIndex = '10';
        stanceBar.appendChild(centerLine);
        
        // å·¥ä¸šåŒºåŸŸ
        const industrialZone = document.createElement('div');
        industrialZone.className = 'metrics-bar-industrial';
        industrialZone.style.position = 'absolute';
        industrialZone.style.height = '100%';
        industrialZone.style.backgroundColor = '#3B82F6';
        industrialZone.style.left = '0';
        industrialZone.style.width = '0%'; // åˆå§‹å®½åº¦ä¸º0ï¼Œç”¨äºŽåŠ¨ç”»
        industrialZone.style.transition = 'width 1s ease-in-out';
        
        // ç”Ÿæ€åŒºåŸŸ
        const ecologicalZone = document.createElement('div');
        ecologicalZone.className = 'metrics-bar-ecological';
        ecologicalZone.style.position = 'absolute';
        ecologicalZone.style.height = '100%';
        ecologicalZone.style.backgroundColor = '#22C55E'; // æ›´é«˜çº§ç»¿è‰²
        ecologicalZone.style.right = '0';
        ecologicalZone.style.width = '0%'; // åˆå§‹å®½åº¦ä¸º0ï¼Œç”¨äºŽåŠ¨ç”»
        ecologicalZone.style.transition = 'width 1s ease-in-out';
        
        // æ•°å€¼æ ‡ç­¾å®¹å™¨
        const stanceValues = document.createElement('div');
        stanceValues.className = 'metrics-value';
        stanceValues.style.position = 'absolute';
        stanceValues.style.inset = '0';
        stanceValues.style.display = 'flex';
        stanceValues.style.alignItems = 'center';
        stanceValues.style.justifyContent = 'space-between';
        stanceValues.style.padding = '0 0.75rem';
        
        // å·¥ä¸šæ•°å€¼
        const industrialValue = document.createElement('span');
        industrialValue.textContent = `${Math.round(industrialPosition)}%`;
        industrialValue.style.fontSize = '0.75rem';
        industrialValue.style.fontWeight = '700';
        industrialValue.style.color = 'white';
        industrialValue.style.opacity = '0'; // åˆå§‹ä¸ºä¸å¯è§
        industrialValue.style.transition = 'opacity 0.5s';
        
        // ç”Ÿæ€æ•°å€¼
        const ecologicalValue = document.createElement('span');
        ecologicalValue.textContent = `${Math.round(ecologicalPosition)}%`;
        ecologicalValue.style.fontSize = '0.75rem';
        ecologicalValue.style.fontWeight = '700';
        ecologicalValue.style.color = 'white';
        ecologicalValue.style.opacity = '0'; // åˆå§‹ä¸ºä¸å¯è§
        ecologicalValue.style.transition = 'opacity 0.5s';
        
        // ç»„è£…è¿›åº¦æ¡
        stanceValues.appendChild(industrialValue);
        stanceValues.appendChild(ecologicalValue);
        
        stanceBar.appendChild(industrialZone);
        stanceBar.appendChild(ecologicalZone);
        stanceBar.appendChild(stanceValues);
        
        // æ—¶é—´çº¿è¿›åº¦åŒºåŸŸ
        const timelineContainer = document.createElement('div');
        
        // æ—¶é—´çº¿æ ‡ç­¾
        const timelineLabel = document.createElement('div');
        timelineLabel.className = 'metrics-label';
        timelineLabel.style.marginTop = '1.5rem';
        
        const timelineLabelText = document.createElement('span');
        timelineLabelText.textContent = 'Timeline Progress';
        timelineLabelText.style.fontWeight = '500';
        timelineLabelText.style.color = '#4B5563';
        
        timelineLabel.appendChild(timelineLabelText);
        
        // æ—¶é—´çº¿è¿›åº¦æ¡
        const timelineBar = document.createElement('div');
        timelineBar.className = 'metrics-bar';
        timelineBar.style.position = 'relative';
        timelineBar.style.height = '2rem';
        timelineBar.style.backgroundColor = '#F3F4F6';
        timelineBar.style.borderRadius = '9999px';
        timelineBar.style.overflow = 'hidden';
        timelineBar.style.border = '1px solid #D1D5DB';
        timelineBar.style.boxShadow = 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)';
        
        // æ—¶é—´çº¿è¿›åº¦
        const timelineProgress = document.createElement('div');
        timelineProgress.className = 'metrics-bar-timeline';
        timelineProgress.style.position = 'absolute';
        timelineProgress.style.height = '100%';
        timelineProgress.style.left = '0';
        timelineProgress.style.width = '0%'; // åˆå§‹å®½åº¦ä¸º0ï¼Œç”¨äºŽåŠ¨ç”»
        
        // å¹´ä»½å€¼æ ‡ç­¾
        const timelineValue = document.createElement('div');
        timelineValue.className = 'metrics-value';
        timelineValue.style.position = 'absolute';
        timelineValue.style.inset = '0';
        timelineValue.style.display = 'flex';
        timelineValue.style.alignItems = 'center';
        timelineValue.style.justifyContent = 'flex-start';
        timelineValue.style.padding = '0 0.75rem';
        
        // å¹´ä»½æ–‡æœ¬
        const yearValue = document.createElement('span');
        yearValue.textContent = `Year ${gameState.gameMetrics.year} of 10`;
        yearValue.style.fontSize = '0.75rem';
        yearValue.style.fontWeight = '700';
        yearValue.style.color = 'white';
        yearValue.style.opacity = '0'; // åˆå§‹ä¸ºä¸å¯è§
        yearValue.style.transition = 'opacity 0.5s';
        
        timelineValue.appendChild(yearValue);
        timelineBar.appendChild(timelineProgress);
        timelineBar.appendChild(timelineValue);
        
        // æ—¶é—´çº¿åˆ»åº¦æ ‡è®°
        const timelineMarkers = document.createElement('div');
        timelineMarkers.className = 'timeline-markers';
        timelineMarkers.style.display = 'flex';
        timelineMarkers.style.justifyContent = 'space-between';
        timelineMarkers.style.marginTop = '0.5rem';
        
        // å¹´ä»½åˆ»åº¦
        const year1 = document.createElement('span');
        year1.textContent = 'Year 1';
        year1.style.fontSize = '0.875rem';
        year1.style.color = '#4B5563';
        
        const year5 = document.createElement('span');
        year5.textContent = 'Year 5';
        year5.style.fontSize = '0.875rem';
        year5.style.color = '#4B5563';
        
        const year10 = document.createElement('span');
        year10.textContent = 'Year 10';
        year10.style.fontSize = '0.875rem';
        year10.style.color = '#4B5563';
        
        timelineMarkers.appendChild(year1);
        timelineMarkers.appendChild(year5);
        timelineMarkers.appendChild(year10);
        
        // ç»„è£…æ—¶é—´çº¿
        timelineContainer.appendChild(timelineLabel);
        timelineContainer.appendChild(timelineBar);
        timelineContainer.appendChild(timelineMarkers);
        
        // ç»„è£…æŒ‡æ ‡åŒºåŸŸ
        stanceContainer.appendChild(stanceLabel);
        stanceContainer.appendChild(stanceBar);
        
        metricsContainer.appendChild(stanceContainer);
        metricsContainer.appendChild(timelineContainer);
        
        // äº‹ä»¶å¡ç‰‡
        const eventCard = document.createElement('div');
        eventCard.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        eventCard.style.borderRadius = '0.75rem';
        eventCard.style.padding = '2rem';
        eventCard.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        eventCard.style.marginBottom = '2rem';
        eventCard.style.opacity = '0'; // åˆå§‹è®¾ä¸ºä¸å¯è§
        eventCard.style.transform = 'translateY(20px)';
        eventCard.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        
        // äº‹ä»¶æ ‡é¢˜åŒºåŸŸ
        const eventTitleContainer = document.createElement('div');
        eventTitleContainer.style.textAlign = 'center';
        eventTitleContainer.style.marginBottom = '2rem';
        
        // å¹´ä»½æ ‡ç­¾
        const eventYearLabel = document.createElement('div');
        eventYearLabel.textContent = `YEAR ${gameState.currentEvent.year}`;
        eventYearLabel.style.fontSize = '1rem';
        eventYearLabel.style.fontWeight = '600';
        eventYearLabel.style.color = '#4B5563';
        eventYearLabel.style.marginBottom = '0.5rem';
        
        // äº‹ä»¶æ ‡é¢˜
        const eventTitle = document.createElement('h2');
        eventTitle.textContent = gameState.currentEvent.title;
        eventTitle.style.fontSize = '2.5rem';
        eventTitle.style.fontWeight = '700';
        eventTitle.style.color = '#1F2937';
        eventTitle.style.margin = '0 0 0.5rem 0';
        
        // æ·»åŠ åˆ†éš”çº¿
        const titleDivider = document.createElement('div');
        titleDivider.style.width = '50%';
        titleDivider.style.height = '3px';
        titleDivider.style.backgroundColor = '#3B82F6';
        titleDivider.style.margin = '0 auto';
        
        eventTitleContainer.appendChild(eventYearLabel);
        eventTitleContainer.appendChild(eventTitle);
        eventTitleContainer.appendChild(titleDivider);
        
        // äº‹ä»¶æè¿°
        const eventDescription = document.createElement('p');
        eventDescription.textContent = gameState.currentEvent.description;
        eventDescription.style.fontSize = '1.25rem';
        eventDescription.style.color = '#1F2937';
        eventDescription.style.marginBottom = '2rem';
        eventDescription.style.textAlign = 'center';
        
        eventCard.appendChild(eventTitleContainer);
        eventCard.appendChild(eventDescription);
        
        // é€‰é¡¹æˆ–å†³ç­–æ‘˜è¦åŒºåŸŸ
        // æ–°å¢žï¼šç”¨ä¸´æ—¶å˜é‡selectedOptionIdè®°å½•å½“å‰é«˜äº®é€‰é¡¹
        let selectedOptionId = null;
        // ä»…åœ¨é¡µé¢é¦–æ¬¡æ¸²æŸ“æ—¶èµ‹å€¼
        if (!gameState.selectedOption && !gameState.factShown) {
            // æ˜¾ç¤ºé€‰é¡¹
            const optionsContainer = document.createElement('div');
            optionsContainer.style.display = 'flex';
            optionsContainer.style.flexDirection = 'column';
            optionsContainer.style.gap = '1rem';
            let lockedOptions = [];
            
            // ç¬¬ä¸ƒå¹´é€‰é¡¹é”å®šé€»è¾‘ - åŸºäºŽç¬¬å››å¹´çš„é€‰æ‹©
            if (gameState.gameMetrics.year === 7) {
                // ç¬¬ä¸ƒå¹´éœ€è¦æ ¹æ®ç¬¬å››å¹´é€‰æ‹©è¿›è¡Œé”å®š
                console.log("Checking Year 7 lock logic:", gameState.selectedOptionsByYear);
                if (gameState.currentEvent.lockByYear4) {
                    const year4Option = gameState.selectedOptionsByYear[4];
                    console.log("Year 4 choice:", year4Option);
                    if (year4Option) {
                        // æ‰¾åˆ°ç¬¬å››å¹´çš„é€‰é¡¹å¯¹è±¡
                        const year4Event = eventsData.find(e => e.year === 4);
                        if (year4Event) {
                            const selectedOption = year4Event.options.find(opt => opt.id === year4Option);
                            console.log("Found Year 4 option:", selectedOption);
                            if (selectedOption && selectedOption.nextYear7Lock) {
                                lockedOptions = selectedOption.nextYear7Lock;
                                console.log("Year 7 locked options:", lockedOptions);
                            }
                        }
                    }
                }
            }
            
            // ç¬¬ä¹å¹´é€‰é¡¹é”å®šé€»è¾‘ - åŸºäºŽç¬¬äº”å¹´çš„é€‰æ‹©
            if (gameState.gameMetrics.year === 9) {
                // ç¬¬ä¹å¹´éœ€è¦æ ¹æ®ç¬¬äº”å¹´é€‰æ‹©è¿›è¡Œé”å®š
                console.log("Checking Year 9 lock:", gameState.selectedOptionsByYear);
                if (gameState.currentEvent.lockByYear5) {
                    const year5Option = gameState.selectedOptionsByYear[5];
                    console.log("Year 5 choice:", year5Option);
                    if (year5Option) {
                        // æ‰¾åˆ°ç¬¬äº”å¹´çš„é€‰é¡¹å¯¹è±¡
                        const year5Event = eventsData.find(e => e.year === 5);
                        if (year5Event) {
                            const selectedOption = year5Event.options.find(opt => opt.id === year5Option);
                            if (selectedOption && selectedOption.nextYear9Lock) {
                                lockedOptions = selectedOption.nextYear9Lock;
                                console.log("Year 9 locked options:", lockedOptions);
                            }
                        }
                    }
                }
            }
            
            // é€‰é¡¹æç¤º - ç¬¬ä¸ƒå¹´å’Œç¬¬ä¹å¹´æ—¶ï¼Œå‘ŠçŸ¥çŽ©å®¶æœ‰é€‰é¡¹è¢«é”å®šçš„åŽŸå› 
            if (gameState.gameMetrics.year === 7 || gameState.gameMetrics.year === 9) {
                const lockInfoContainer = document.createElement('div');
                lockInfoContainer.style.backgroundColor = '#E0F2FE'; // æµ…è“è‰²èƒŒæ™¯
                lockInfoContainer.style.padding = '1rem';
                lockInfoContainer.style.borderRadius = '0.5rem';
                lockInfoContainer.style.marginBottom = '1.5rem';
                lockInfoContainer.style.textAlign = 'center';
                lockInfoContainer.style.border = '1px solid #BAE6FD';
                
                const lockInfo = document.createElement('p');
                lockInfo.style.margin = '0';
                lockInfo.style.fontSize = '1rem';
                lockInfo.style.color = '#0369A1'; // æ·±è“è‰²æ–‡å­—
                
                if (gameState.gameMetrics.year === 7) {
                    const year4Option = gameState.selectedOptionsByYear[4];
                    const year4Event = eventsData.find(e => e.year === 4);
                    const selectedOption = year4Event.options.find(opt => opt.id === year4Option);
                    if (selectedOption) {
                        lockInfo.textContent = `Based on your choice in Year 4 (Option ${year4Option}), some options are locked`;
                    }
                } else if (gameState.gameMetrics.year === 9) {
                    const year5Option = gameState.selectedOptionsByYear[5];
                    const year5Event = eventsData.find(e => e.year === 5);
                    const selectedOption = year5Event.options.find(opt => opt.id === year5Option);
                    if (selectedOption) {
                        lockInfo.textContent = `Based on your choice in Year 5 (Option ${year5Option}), only one option is available`;
                    }
                }
                
                lockInfoContainer.appendChild(lockInfo);
                eventCard.appendChild(lockInfoContainer);
            }
            
            // é€‰é¡¹æ¸²æŸ“ - ç¬¬ä¸ƒå¹´å’Œç¬¬ä¹å¹´æ—¶ï¼Œæ˜¾ç¤ºæ‰€æœ‰é€‰é¡¹ï¼ˆåŒ…æ‹¬é”å®šé€‰é¡¹ï¼‰
            gameState.currentEvent.options.forEach(option => {
                // åˆ¤æ–­é€‰é¡¹æ˜¯å¦è¢«é”å®š
                const isLocked = (gameState.gameMetrics.year === 7 || gameState.gameMetrics.year === 9) && 
                                 lockedOptions.includes(option.id);
                
                const optionCard = document.createElement('div');
                
                // å¢žå¼ºé€‰é¡¹å¡çš„è§†è§‰æ•ˆæžœå’Œäº¤äº’åŠ¨ç”»
                optionCard.style.backgroundColor = isLocked ? '#E5E7EB' : (selectedOptionId === option.id ? '#3B82F6' : '#F9FAFB');
                optionCard.style.color = isLocked ? '#9CA3AF' : (selectedOptionId === option.id ? '#fff' : '#1F2937');
                optionCard.style.border = '1px solid ' + (isLocked ? '#D1D5DB' : (selectedOptionId === option.id ? '#3B82F6' : '#E5E7EB'));
                optionCard.style.borderRadius = '0.75rem'; // å¢žå¤§åœ†è§’
                optionCard.style.padding = '1.5rem';
                optionCard.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'; // æ›´å¹³æ»‘çš„åŠ¨ç”»æ›²çº¿
                optionCard.style.cursor = isLocked ? 'not-allowed' : 'pointer';
                optionCard.style.opacity = isLocked ? '0.6' : '1';
                optionCard.style.boxShadow = isLocked ? 'none' : (selectedOptionId === option.id ? '0 12px 24px 0 rgba(59,130,246,0.25)' : '0 2px 6px rgba(0,0,0,0.05)');
                optionCard.style.transform = isLocked ? 'none' : (selectedOptionId === option.id ? 'translateY(-8px)' : 'translateY(0)');
                optionCard.style.position = 'relative';
                
                // å¦‚æžœé€‰é¡¹è¢«é”å®šï¼Œæ·»åŠ é”å®šå›¾æ ‡
                if (isLocked) {
                    const lockIcon = document.createElement('div');
                    lockIcon.style.position = 'absolute';
                    lockIcon.style.top = '1rem';
                    lockIcon.style.right = '1rem';
                    lockIcon.style.fontSize = '1.25rem';
                    lockIcon.textContent = 'ðŸ”’';
                    optionCard.appendChild(lockIcon);
                }
                
                // æ‚¬åœæ•ˆæžœå¢žå¼º
                optionCard.addEventListener('mouseover', () => {
                    if (!isLocked && selectedOptionId !== option.id) {
                        optionCard.style.backgroundColor = '#F0F9FF'; // æµ…è“è‰²èƒŒæ™¯
                        optionCard.style.boxShadow = '0 10px 20px rgba(59,130,246,0.18)';
                        optionCard.style.transform = 'translateY(-6px) scale(1.02)';
                        optionCard.style.borderColor = '#BFDBFE';
                    }
                });
                
                optionCard.addEventListener('mouseout', () => {
                    if (!isLocked && selectedOptionId !== option.id) {
                    optionCard.style.backgroundColor = '#F9FAFB';
                        optionCard.style.boxShadow = '0 2px 6px rgba(0,0,0,0.05)';
                        optionCard.style.transform = 'translateY(0) scale(1)';
                        optionCard.style.borderColor = '#E5E7EB';
                    }
                });
                
                // ç‚¹å‡»æ•ˆæžœå¢žå¼º
                optionCard.addEventListener('mousedown', () => {
                    if (!isLocked) {
                        optionCard.style.transform = 'translateY(-2px) scale(0.98)';
                        optionCard.style.boxShadow = '0 4px 10px rgba(59,130,246,0.12)';
                    }
                });
                
                optionCard.addEventListener('mouseup', () => {
                    if (!isLocked) {
                        optionCard.style.transform = 'translateY(-6px) scale(1.02)';
                        optionCard.style.boxShadow = '0 10px 20px rgba(59,130,246,0.18)';
                    }
                });
                
                optionCard.addEventListener('click', () => {
                    // å¦‚æžœé€‰é¡¹è¢«é”å®šï¼Œä¸æ‰§è¡Œä»»ä½•æ“ä½œ
                    if (isLocked) return;
                    
                    // ç‚¹å‡»åŠ¨ç”»æ•ˆæžœ
                    optionCard.style.transform = 'scale(1.08)';
                    optionCard.style.boxShadow = '0 15px 30px rgba(59,130,246,0.3)';
                    
                    setTimeout(() => {
                        // å…ˆå–æ¶ˆæ‰€æœ‰é«˜äº®
                        Array.from(optionsContainer.children).forEach(child => {
                            // æ£€æµ‹æ˜¯å¦æ˜¯é”å®šé€‰é¡¹
                            const childLockIcon = child.querySelector('div');
                            const childIsLocked = childLockIcon && childLockIcon.textContent === 'ðŸ”’';
                            
                            if (childIsLocked) {
                                child.style.backgroundColor = '#E5E7EB';
                                child.style.color = '#9CA3AF';
                                child.style.opacity = '0.6';
                            } else {
                                child.style.backgroundColor = '#F9FAFB';
                                child.style.color = '#1F2937';
                                child.style.boxShadow = '0 2px 6px rgba(0,0,0,0.05)';
                                child.style.transform = 'translateY(0) scale(1)';
                                child.style.borderColor = '#E5E7EB';
                            }
                            
                            // æ›´æ–°é€‰é¡¹IDé¢œè‰²
                            const idSpan = child.querySelector('span');
                            if (idSpan) idSpan.style.color = childIsLocked ? '#9CA3AF' : '#3B82F6';
                            
                            // æ›´æ–°æ•ˆæžœæè¿°é¢œè‰²
                            const effectsP = child.querySelector('p:last-child');
                            if (effectsP) effectsP.style.color = childIsLocked ? '#9CA3AF' : '#6B7280';
                        });
                        
                        // é«˜äº®å½“å‰
                        optionCard.style.backgroundColor = '#3B82F6';
                        optionCard.style.color = '#fff';
                        optionCard.style.boxShadow = '0 12px 24px 0 rgba(59,130,246,0.25)';
                        optionCard.style.transform = 'translateY(-8px)';
                        optionCard.style.borderColor = '#3B82F6';
                        
                        // æ›´æ–°é€‰é¡¹IDé¢œè‰²
                        const idSpan = optionCard.querySelector('span');
                        if (idSpan) idSpan.style.color = '#fff';
                        
                        // æ›´æ–°æ•ˆæžœæè¿°é¢œè‰²
                        const effectsP = optionCard.querySelector('p:last-child');
                        if (effectsP) effectsP.style.color = '#e0e7ef';
                        
                        // åªè®°å½•ä¸´æ—¶idï¼Œä¸ç›´æŽ¥èµ‹å€¼gameState.selectedOption
                        selectedOptionId = option.id;
                        
                        // æ¿€æ´»CONTINUEæŒ‰é’®
                        continueButton.disabled = false;
                        applyModernButtonStyle(continueButton, {disabled: false});
                    }, 150);
                });
                
                // é€‰é¡¹ ID å’Œæ–‡æœ¬
                const optionText = document.createElement('p');
                optionText.style.margin = '0 0 0.5rem 0';
                optionText.style.fontSize = '1.125rem';
                const optionId = document.createElement('span');
                optionId.textContent = `${option.id} - `;
                optionId.style.color = selectedOptionId === option.id ? '#fff' : (isLocked ? '#9CA3AF' : '#3B82F6');
                optionId.style.fontWeight = '700';
                optionText.appendChild(optionId);
                optionText.appendChild(document.createTextNode(option.text));
                
                // é€‰é¡¹æ•ˆæžœæè¿°
                const optionEffects = document.createElement('p');
                optionEffects.style.margin = '0';
                optionEffects.style.fontSize = '0.875rem';
                optionEffects.style.color = selectedOptionId === option.id ? '#e0e7ef' : (isLocked ? '#9CA3AF' : '#6B7280');
                optionEffects.textContent = option.effectsDisplay;
                
                optionCard.appendChild(optionText);
                optionCard.appendChild(optionEffects);
                optionsContainer.appendChild(optionCard);
            });
            eventCard.appendChild(optionsContainer);
        } else if (gameState.selectedOption && !gameState.factShown) {
            // å†³ç­–æ‘˜è¦+View Facté¡µé¢ï¼ˆå®Œæ•´è¿˜åŽŸï¼‰
            const summaryContainer = document.createElement('div');
            summaryContainer.style.backgroundColor = '#EFF6FF';
            summaryContainer.style.border = '1px solid #BFDBFE';
            summaryContainer.style.borderRadius = '0.5rem';
            summaryContainer.style.padding = '1.5rem';
            summaryContainer.style.marginBottom = '2rem';
            summaryContainer.style.position = 'relative'; // æ·»åŠ ç›¸å¯¹å®šä½ä»¥ä¾¿æ”¾ç½®View FactsæŒ‰é’®
            summaryContainer.style.display = 'flex'; // ä½¿ç”¨flexå¸ƒå±€
            summaryContainer.style.flexDirection = 'column'; // åž‚ç›´æŽ’åˆ—
            summaryContainer.style.alignItems = 'center'; // æ°´å¹³å±…ä¸­
            const summaryTitle = document.createElement('h3');
            summaryTitle.textContent = 'Decision Summary';
            summaryTitle.style.textAlign = 'center';
            summaryTitle.style.margin = '0 0 1rem 0';
            summaryTitle.style.color = '#2563EB';
            summaryTitle.style.fontSize = '1.25rem';
            const chosenOption = document.createElement('p');
            chosenOption.textContent = `You have chosen option ${gameState.selectedOption.id}`;
            chosenOption.style.textAlign = 'center';
            chosenOption.style.margin = '0 0 0.5rem 0';
            chosenOption.style.fontWeight = '600';
            const effects = document.createElement('p');
            effects.textContent = gameState.selectedOption.effectsDisplay;
            effects.style.textAlign = 'center';
            effects.style.color = '#2563EB'; // æ”¹ä¸ºè“è‰²
            effects.style.fontWeight = '700'; // åŠ ç²—æ˜¾ç¤ºæ•ˆæžœæ–‡æœ¬
            effects.style.fontSize = '1.1rem'; // å¢žåŠ å­—ä½“å¤§å°
            effects.style.padding = '0.5rem 1rem'; // æ·»åŠ å†…è¾¹è·
            effects.style.backgroundColor = 'rgba(219, 234, 254, 0.5)'; // æ·»åŠ æ·¡è“è‰²èƒŒæ™¯
            effects.style.borderRadius = '0.5rem'; // åœ†è§’è¾¹æ¡†
            effects.style.display = 'table'; // æ”¹ä¸ºtableå…ƒç´ ä»¥ä¾¿å±…ä¸­
            effects.style.margin = '0 auto 1rem auto'; // å±…ä¸­æ˜¾ç¤º
            
            // ä¿®æ”¹æ·»åŠ æŠ½å¡å†…å®¹æ˜¾ç¤ºé€»è¾‘
            const deckInfo = document.createElement('p');
            if (gameState.selectedOption.additionalDeck) {
            deckInfo.textContent = `Add Additional Deck (${gameState.selectedOption.additionalDeck}) into your Events Deck.`;
            deckInfo.style.textAlign = 'center';
            deckInfo.style.fontSize = '1rem'; // å¢žåŠ å­—ä½“å¤§å°
            deckInfo.style.margin = '0 auto'; // å±…ä¸­æ˜¾ç¤º
            deckInfo.style.color = '#2563EB'; // æ·»åŠ è“è‰²çªæ˜¾
            deckInfo.style.fontWeight = '700'; // åŠ ç²—æ˜¾ç¤ºé¢å¤–å¡ç»„ä¿¡æ¯
            deckInfo.style.padding = '0.5rem 1rem'; // æ·»åŠ å†…è¾¹è·
            deckInfo.style.backgroundColor = 'rgba(219, 234, 254, 0.7)'; // æ·»åŠ æ›´æ·±è“è‰²èƒŒæ™¯
            deckInfo.style.borderRadius = '0.5rem'; // åœ†è§’è¾¹æ¡†
            deckInfo.style.display = 'table'; // æ”¹ä¸ºtableå…ƒç´ ä»¥ä¾¿å±…ä¸­
            deckInfo.style.margin = '0 auto'; // å±…ä¸­æ˜¾ç¤º
            deckInfo.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'; // æ·»åŠ è½»å¾®é˜´å½±
            }
            
            summaryContainer.appendChild(summaryTitle);
            summaryContainer.appendChild(chosenOption);
            summaryContainer.appendChild(effects);
            if (gameState.selectedOption.additionalDeck) {
            summaryContainer.appendChild(deckInfo);
            }
            
            // æ·»åŠ View FactsæŒ‰é’®åˆ°summaryContainerå³ä¸Šè§’
            const viewFactsButton = document.createElement('button');
            viewFactsButton.className = 'btn btn-secondary';
            viewFactsButton.style.position = 'absolute';
            viewFactsButton.style.right = '1rem';
            viewFactsButton.style.top = '1rem';
            viewFactsButton.style.display = 'flex';
            viewFactsButton.style.alignItems = 'center';
            viewFactsButton.style.justifyContent = 'center';
            viewFactsButton.style.gap = '0.25rem';
            viewFactsButton.style.padding = '0.5rem 1rem';
            viewFactsButton.style.fontSize = '0.9rem';
            viewFactsButton.style.borderRadius = '0.75rem';
            viewFactsButton.style.backgroundColor = 'white';
            viewFactsButton.style.border = '1px solid #2563EB';
            viewFactsButton.style.color = '#2563EB';
            viewFactsButton.style.fontWeight = '500';
            viewFactsButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
            viewFactsButton.style.transition = 'all 0.3s ease';
            
            // æ·»åŠ æ‚¬åœæ•ˆæžœ
            viewFactsButton.addEventListener('mouseover', () => {
                viewFactsButton.style.transform = 'translateY(-2px)';
                viewFactsButton.style.boxShadow = '0 4px 8px rgba(37, 99, 235, 0.2)';
            });
            
            viewFactsButton.addEventListener('mouseout', () => {
                viewFactsButton.style.transform = 'translateY(0)';
                viewFactsButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
            });
            
            viewFactsButton.addEventListener('mousedown', () => {
                viewFactsButton.style.transform = 'scale(0.98)';
            });
            
            viewFactsButton.addEventListener('mouseup', () => {
                viewFactsButton.style.transform = 'translateY(-2px)';
            });
            
            const factIcon = document.createElement('span');
            factIcon.textContent = 'ðŸ”';
            viewFactsButton.appendChild(factIcon);
            viewFactsButton.appendChild(document.createTextNode('View Facts'));
            viewFactsButton.addEventListener('click', () => {
                transitionToScreen('fact-view');
            });
            
            summaryContainer.appendChild(viewFactsButton);
            
            const instruction = document.createElement('p');
            instruction.textContent = 'Each person should draw 1 card from the Event Deck. Solve the drawn Event Card collectively, then proceed to the next person.';
            instruction.style.textAlign = 'center';
            instruction.style.margin = '0 0 2rem 0';
            
            eventCard.appendChild(summaryContainer);
            eventCard.appendChild(instruction);
        }
        // CONTINUEæŒ‰é’®åŒºåŸŸ
        const continueButtonContainer = document.createElement('div');
        continueButtonContainer.style.display = 'flex';
        continueButtonContainer.style.justifyContent = 'center';
        continueButtonContainer.style.opacity = '0';
        continueButtonContainer.style.transform = 'translateY(20px)';
        continueButtonContainer.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        const continueButton = document.createElement('button');
        // CONTINUEæŒ‰é’®çŠ¶æ€é€»è¾‘å°è£…ä¸ºå‡½æ•°ï¼Œä¾¿äºŽåŠ¨æ€æ›´æ–°
        function updateContinueButtonState() {
            if (!selectedOptionId && !gameState.selectedOption) {
                continueButton.textContent = 'CONTINUE';
                continueButton.disabled = true;
                applyModernButtonStyle(continueButton, {disabled: true});
            } else if (!gameState.factShown) {
                continueButton.textContent = 'CONTINUE';
                continueButton.disabled = false;
                applyModernButtonStyle(continueButton, {disabled: false});
            } else {
                continueButton.textContent = 'CONTINUE TO NEXT YEAR';
                continueButton.disabled = false;
                applyModernButtonStyle(continueButton, {disabled: false});
            }
        }
        updateContinueButtonState();
        continueButton.style.marginTop = '2.5rem';
        
        // å¢žå¼ºCONTINUEæŒ‰é’®çš„äº¤äº’åŠ¨ç”»
        continueButton.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, background 0.3s ease';
            continueButton.addEventListener('mouseover', () => {
            if (!continueButton.disabled) {
                continueButton.style.transform = 'translateY(-5px) scale(1.05)';
                continueButton.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.25)';
            }
        });
            continueButton.addEventListener('mouseout', () => {
            if (!continueButton.disabled) {
                continueButton.style.transform = 'translateY(0) scale(1)';
                continueButton.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
            }
        });
            continueButton.addEventListener('mousedown', () => {
            if (!continueButton.disabled) {
                continueButton.style.transform = 'translateY(0) scale(0.97)';
                continueButton.style.boxShadow = '0 2px 6px rgba(59, 130, 246, 0.12)';
            }
            });
            continueButton.addEventListener('mouseup', () => {
            if (!continueButton.disabled) {
                continueButton.style.transform = 'translateY(-5px) scale(1.05)';
                continueButton.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.25)';
            }
            });
            
        // æ·»åŠ ç‚¹å‡»äº‹ä»¶å¤„ç†å™¨
            continueButton.addEventListener('click', () => {
            if (continueButton.disabled) return;
            // å¦‚æžœè¿˜æ²¡è¿›å…¥å†³ç­–æ‘˜è¦ï¼Œç‚¹å‡»CONTINUEæ—¶æ‰æ­£å¼æäº¤é€‰é¡¹
            if (!gameState.selectedOption && selectedOptionId) {
                // æ‰¾åˆ°é€‰ä¸­çš„optionå¯¹è±¡
                const selectedOptionObj = gameState.currentEvent.options.find(opt => opt.id === selectedOptionId);
                gameState.selectedOption = selectedOptionObj;
                // ä¿å­˜å½“å‰å¹´ä»½çš„é€‰æ‹©åˆ°selectedOptionsByYear
                gameState.selectedOptionsByYear[gameState.currentEvent.year] = selectedOptionId;
                console.log("Saving choice:", gameState.currentEvent.year, selectedOptionId, gameState.selectedOptionsByYear);
                // è®°å½•IND/ECO stanceå˜åŒ–
                gameState.gameMetrics.industrialStance = Math.min(100, Math.max(0, gameState.gameMetrics.industrialStance + selectedOptionObj.effects.industrialStance));
                gameState.gameMetrics.ecologicalStance = Math.min(100, Math.max(0, gameState.gameMetrics.ecologicalStance + selectedOptionObj.effects.ecologicalStance));
                renderScreen('main-game');
                return;
            }
            if (!gameState.factShown) {
                gameState.factShown = true;
                // ç›´æŽ¥è¿›å…¥å°äº‹ä»¶æŠ½å¡é¡µé¢
                gameState.recordEventDrawn = gameState.selectedCharacters.map(() => false);
                transitionToScreen('record-event-card-draw');
                } else {
                // å…¼å®¹æ€§å¤„ç†ï¼Œæ­£å¸¸æµç¨‹ä¸ä¼šèµ°åˆ°è¿™é‡Œ
                gameState.recordEventDrawn = gameState.selectedCharacters.map(() => false);
                transitionToScreen('record-event-card-draw');
                }
            });
        
        continueButtonContainer.appendChild(continueButton);
        
        // å°†æ‰€æœ‰å…ƒç´ æ·»åŠ åˆ°å†…å®¹å®¹å™¨
        contentContainer.appendChild(metricsContainer);
        contentContainer.appendChild(eventCard);
        contentContainer.appendChild(continueButtonContainer);
        
        // æ·»åŠ åˆ°å±å¹•
        screenElement.appendChild(contentContainer);
        
        // è§¦å‘åŠ¨ç”»æ•ˆæžœ
        setTimeout(() => {
            // è¿›åº¦æ¡åŠ¨ç”»
            industrialZone.style.width = `${stanceToBarWidth(industrialPosition)}%`;
            ecologicalZone.style.width = `${stanceToBarWidth(ecologicalPosition)}%`;
            timelineProgress.style.width = `${timelinePosition}%`;
            
            // æ•°å€¼æ˜¾ç¤º
            if (industrialPosition > 8) {
                industrialValue.style.opacity = '1';
            }
            
            if (ecologicalPosition > 8) {
                ecologicalValue.style.opacity = '1';
            }
            
            if (timelinePosition > 8) {
                yearValue.style.opacity = '1';
            }
            
            // å¡ç‰‡åŠ¨ç”»
            setTimeout(() => {
                eventCard.style.opacity = '1';
                eventCard.style.transform = 'translateY(0)';
                
                // æŒ‰é’®åŠ¨ç”»
                setTimeout(() => {
                    continueButtonContainer.style.opacity = '1';
                    continueButtonContainer.style.transform = 'translateY(0)';
                }, 400);
            }, 600);
        }, 300);
    }

    function renderFactViewScreen(screenElement) {
        if (!gameState.currentEvent) return;
        
        const factContent = gameState.currentEvent.factContent;
        
        // åˆ›å»ºå¤–å±‚å±…ä¸­å®¹å™¨
        const outerContainer = document.createElement('div');
        outerContainer.style.display = 'flex';
        outerContainer.style.flexDirection = 'column';
        outerContainer.style.alignItems = 'center';
        outerContainer.style.justifyContent = 'center';
        outerContainer.style.minHeight = '90vh';
        outerContainer.style.padding = '2rem 0';
        
        // Create fact container with improved styling
        const factContainer = document.createElement('div');
        factContainer.className = 'fact-container';
        factContainer.style.width = '100%';
        factContainer.style.maxWidth = '900px';
        factContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        factContainer.style.borderRadius = '1rem';
        factContainer.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
        factContainer.style.overflow = 'hidden';
        
        // Header section with title and back button
        const factHeader = document.createElement('div');
        factHeader.className = 'fact-header';
        factHeader.style.display = 'flex';
        factHeader.style.justifyContent = 'space-between';
        factHeader.style.alignItems = 'center';
        factHeader.style.padding = '1.5rem 2rem';
        factHeader.style.borderBottom = '1px solid rgba(0, 0, 0, 0.1)';
        
        const headerLeft = document.createElement('div');
        
        const yearLabel = document.createElement('h2');
        yearLabel.textContent = `Year ${gameState.currentEvent.year}`;
        yearLabel.style.margin = '0 0 0.5rem 0';
        yearLabel.style.fontSize = '1.2rem';
        yearLabel.style.color = '#4B5563';
        
        const eventTitle = document.createElement('h3');
        eventTitle.textContent = gameState.currentEvent.title;
        eventTitle.style.margin = '0';
        eventTitle.style.fontSize = '1.8rem';
        eventTitle.style.color = '#2563EB';
        
        const divider = document.createElement('div');
        divider.className = 'event-divider';
        divider.style.margin = '0.5rem 0 0 0';
        divider.style.height = '3px';
        divider.style.width = '60px';
        divider.style.backgroundColor = '#3B82F6';
        divider.style.borderRadius = '1.5px';
        
        headerLeft.appendChild(yearLabel);
        headerLeft.appendChild(eventTitle);
        headerLeft.appendChild(divider);
        
        // å¢žå¤§BackæŒ‰é’®
        const backButton = document.createElement('button');
        backButton.className = 'btn btn-secondary';
        backButton.textContent = 'Back';
        backButton.style.fontSize = '1.1rem';
        backButton.style.fontWeight = '600';
        backButton.style.padding = '0.8rem 1.8rem';
        backButton.style.borderRadius = '0.75rem';
        backButton.style.transition = 'all 0.3s ease';
        backButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.08)';
        
        // æ·»åŠ æ‚¬åœæ•ˆæžœ
        backButton.addEventListener('mouseover', () => {
            backButton.style.transform = 'translateY(-3px)';
            backButton.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.12)';
        });
        
        backButton.addEventListener('mouseout', () => {
            backButton.style.transform = 'translateY(0)';
            backButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.08)';
        });
        
        backButton.addEventListener('click', () => {
            gameState.factShown = false;
            renderScreen('main-game');
        });
        
        factHeader.appendChild(headerLeft);
        factHeader.appendChild(backButton);
        
        // åˆ›å»ºä¸¤åˆ—å¸ƒå±€å®¹å™¨
        const contentLayout = document.createElement('div');
        contentLayout.style.display = 'flex';
        contentLayout.style.flexWrap = 'wrap';
        contentLayout.style.padding = '2rem';
        contentLayout.style.gap = '2rem';
        
        // Fact content section (å·¦ä¾§)
        const factContentDiv = document.createElement('div');
        factContentDiv.className = 'fact-content';
        factContentDiv.style.flex = '1 1 550px';
        
        const factBox = document.createElement('div');
        factBox.className = 'fact-box';
        
        // Fact title
        const factTitle = document.createElement('h2');
        factTitle.className = 'fact-title';
        factTitle.textContent = factContent.title;
        factTitle.style.fontSize = '1.8rem';
        factTitle.style.color = '#2563EB';
        factTitle.style.margin = '0 0 1.5rem 0';
        
        // Introduction paragraph
        const introductionPara = document.createElement('p');
        introductionPara.className = 'fact-paragraph';
        introductionPara.textContent = factContent.introduction;
        introductionPara.style.lineHeight = '1.6';
        introductionPara.style.marginBottom = '1.5rem';
        
        // Impact paragraph
        const impactPara = document.createElement('p');
        impactPara.className = 'fact-paragraph';
        impactPara.textContent = factContent.impact;
        impactPara.style.lineHeight = '1.6';
        impactPara.style.marginBottom = '1.5rem';
        
        // Consequences list
        const consequencesList = document.createElement('ol');
        consequencesList.className = 'fact-list';
        consequencesList.style.paddingLeft = '1.5rem';
        consequencesList.style.marginBottom = '1.5rem';
        
        factContent.consequences.forEach(item => {
            const listItem = document.createElement('li');
            listItem.className = 'fact-list-item';
            listItem.textContent = item;
            listItem.style.padding = '0.5rem 0';
            listItem.style.lineHeight = '1.5';
            consequencesList.appendChild(listItem);
        });
        
        // Conclusion paragraph
        const conclusionPara = document.createElement('p');
        conclusionPara.className = 'fact-paragraph';
        conclusionPara.textContent = factContent.conclusion;
        conclusionPara.style.lineHeight = '1.6';
        conclusionPara.style.marginBottom = '1.5rem';
        
        // Attribution
        const attribution = document.createElement('p');
        attribution.className = 'fact-attribution';
        attribution.textContent = factContent.attribution;
        attribution.style.fontStyle = 'italic';
        attribution.style.color = '#6B7280';
        attribution.style.fontSize = '0.9rem';
        
        // Append all fact content elements
        factBox.appendChild(factTitle);
        factBox.appendChild(introductionPara);
        factBox.appendChild(impactPara);
        factBox.appendChild(consequencesList);
        factBox.appendChild(conclusionPara);
        factBox.appendChild(attribution);
        
        factContentDiv.appendChild(factBox);
        
        // å›¾ç‰‡åŒºåŸŸ (å³ä¾§)
        const imageContainer = document.createElement('div');
        imageContainer.style.flex = '1 1 280px';
        imageContainer.style.display = 'flex';
        imageContainer.style.flexDirection = 'column';
        imageContainer.style.justifyContent = 'flex-start';
        imageContainer.style.alignItems = 'center';
        
        // å›¾ç‰‡å ä½åŒºåŸŸ
        const imagePlaceholder = document.createElement('div');
        imagePlaceholder.style.width = '100%';
        imagePlaceholder.style.paddingBottom = '75%'; // 4:3 æ¯”ä¾‹
        imagePlaceholder.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
        imagePlaceholder.style.borderRadius = '0.75rem';
        imagePlaceholder.style.marginBottom = '1rem';
        imagePlaceholder.style.position = 'relative';
        imagePlaceholder.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.05)';
        imagePlaceholder.style.border = '1px solid rgba(59, 130, 246, 0.2)';
        
        // å›¾ç‰‡å›¾æ ‡å’Œè¯´æ˜Ž
        const imageIcon = document.createElement('div');
        imageIcon.style.position = 'absolute';
        imageIcon.style.inset = '0';
        imageIcon.style.display = 'flex';
        imageIcon.style.flexDirection = 'column';
        imageIcon.style.alignItems = 'center';
        imageIcon.style.justifyContent = 'center';
        
        const iconText = document.createElement('div');
        iconText.textContent = 'ðŸ–¼ï¸';
        iconText.style.fontSize = '3rem';
        iconText.style.marginBottom = '1rem';
        iconText.style.color = '#3B82F6';
        
        const placeholderText = document.createElement('p');
        placeholderText.textContent = 'Image Placeholder';
        placeholderText.style.margin = '0';
        placeholderText.style.color = '#3B82F6';
        placeholderText.style.fontSize = '0.9rem';
        
        imageIcon.appendChild(iconText);
        imageIcon.appendChild(placeholderText);
        imagePlaceholder.appendChild(imageIcon);
        
        // å›¾ç‰‡è¯´æ˜Žæ–‡æœ¬
        const imageCaption = document.createElement('p');
        imageCaption.textContent = `Image related to "${factContent.title}"`;
        imageCaption.style.textAlign = 'center';
        imageCaption.style.color = '#4B5563';
        imageCaption.style.fontSize = '0.9rem';
        
        // ä¸ºæœªæ¥æ”¯æŒçœŸå®žå›¾ç‰‡æ·»åŠ ID
        imagePlaceholder.id = `fact-image-${gameState.currentEvent.year}`;
        
        // æ·»åŠ åˆ°å›¾ç‰‡å®¹å™¨
        imageContainer.appendChild(imagePlaceholder);
        imageContainer.appendChild(imageCaption);
        
        // å°†å†…å®¹åŒºå’Œå›¾ç‰‡åŒºæ·»åŠ åˆ°å¸ƒå±€å®¹å™¨
        contentLayout.appendChild(factContentDiv);
        contentLayout.appendChild(imageContainer);
        
        // Append sections to fact container
        factContainer.appendChild(factHeader);
        factContainer.appendChild(contentLayout);
        
        // Set flag that fact has been viewed
        gameState.factShown = true;
        
        // æ·»åŠ åˆ°å¤–å±‚å®¹å™¨å¹¶åŠ å…¥å±å¹•
        outerContainer.appendChild(factContainer);
        screenElement.appendChild(outerContainer);
    }

    function selectOption(option) {
        gameState.selectedOption = option;
        // è®°å½•æœ¬å¹´é€‰æ‹©
        if (gameState.currentEvent && gameState.currentEvent.year) {
            gameState.selectedOptionsByYear[gameState.currentEvent.year] = option.id;
        }
        showConfirmationModal(option);
    }

    function showConfirmationModal(option) {
        const gameContainer = document.getElementById('game-container');
        
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        // Modal header with icon and title
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        
        const modalIcon = document.createElement('div');
        modalIcon.className = 'modal-icon';
        
        const svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svgIcon.setAttribute('fill', 'none');
        svgIcon.setAttribute('viewBox', '0 0 24 24');
        svgIcon.setAttribute('stroke', 'currentColor');
        svgIcon.setAttribute('width', '24');
        svgIcon.setAttribute('height', '24');
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('d', 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z');
        
        svgIcon.appendChild(path);
        modalIcon.appendChild(svgIcon);
        
        const modalTitle = document.createElement('div');
        modalTitle.className = 'modal-title';
        modalTitle.textContent = 'Confirm Your Choice';
        
        modalHeader.appendChild(modalIcon);
        modalHeader.appendChild(modalTitle);
        
        // Modal question
        const modalQuestion = document.createElement('p');
        modalQuestion.className = 'modal-question';
        modalQuestion.textContent = `Are you sure you want to select Option ${option.id}?`;
        
        // Effects display
        const modalEffects = document.createElement('div');
        modalEffects.className = 'modal-effects';
        
        const effectsTitle = document.createElement('p');
        effectsTitle.className = 'modal-effects-title';
        effectsTitle.textContent = 'Effects:';
        
        const effectsText = document.createElement('p');
        effectsText.textContent = option.effectsDisplay;
        
        modalEffects.appendChild(effectsTitle);
        modalEffects.appendChild(effectsText);
        
        // Action buttons
        const modalActions = document.createElement('div');
        modalActions.className = 'modal-actions';
        
        const cancelButton = document.createElement('button');
        cancelButton.className = 'btn btn-secondary btn-small';
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', () => {
            gameContainer.removeChild(modalOverlay);
            gameState.selectedOption = null;
            renderScreen('main-game');
        });
        
        const confirmButton = document.createElement('button');
        confirmButton.className = 'btn btn-primary btn-small';
        confirmButton.textContent = 'Confirm';
        confirmButton.addEventListener('click', () => {
            // Apply effects to game metrics
            gameState.gameMetrics.industrialStance = Math.min(100, Math.max(0, 
                gameState.gameMetrics.industrialStance + option.effects.industrialStance));
            gameState.gameMetrics.ecologicalStance = Math.min(100, Math.max(0, 
                gameState.gameMetrics.ecologicalStance + option.effects.ecologicalStance));
            
            // Close modal and update game state
            gameContainer.removeChild(modalOverlay);
            gameState.factShown = true;
            renderScreen('main-game');
        });
        
        modalActions.appendChild(cancelButton);
        modalActions.appendChild(confirmButton);
        
        // Assemble modal content
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalQuestion);
        modalContent.appendChild(modalEffects);
        modalContent.appendChild(modalActions);
        
        modalOverlay.appendChild(modalContent);
        gameContainer.appendChild(modalOverlay);
    }

    function transitionToScreen(newScreen) {
        // Set animation inactive
        gameState.animationActive = false;
        const currentScreen = document.querySelector('.screen');
        if (currentScreen) {
            currentScreen.classList.add('inactive');
        }
        
        // Wait for exit animation to complete
        setTimeout(() => {
            // Render new screen
            renderScreen(newScreen);
            
            // Set animation active after a brief delay
            setTimeout(() => {
                gameState.animationActive = true;
            }, 100);
        }, 300);
    }

    function renderRecordEventCardDrawScreen(screenElement) {
        // æ·»åŠ å¤–å±‚å®¹å™¨
        const outerContainer = document.createElement('div');
        outerContainer.style.display = 'flex';
        outerContainer.style.flexDirection = 'column';
        outerContainer.style.minHeight = '100vh';
        outerContainer.style.justifyContent = 'center';
        outerContainer.style.padding = '2rem 0';
        screenElement.appendChild(outerContainer);
        
        // è®¡ç®—å½“å‰æŒ‡æ ‡å€¼
        const industrialPosition = gameState.gameMetrics.industrialStance;
        const ecologicalPosition = gameState.gameMetrics.ecologicalStance;
        const timelinePosition = (gameState.gameMetrics.year / 10) * 100;
        
        // è¿›åº¦æ¡æ˜ å°„å‡½æ•°ï¼š0-100%åªå barçš„0-50%
        function stanceToBarWidth(val) {
            return Math.max(0, Math.min(100, val)) * 0.5;
        }
        
        // æŒ‡æ ‡å®¹å™¨ - æ·»åŠ åœ¨æ ‡é¢˜å‰é¢
        const metricsContainer = document.createElement('div');
        metricsContainer.className = 'metrics-container';
        metricsContainer.style.marginBottom = '1.5rem';
        metricsContainer.style.width = '100%';
        metricsContainer.style.maxWidth = '700px';
        metricsContainer.style.margin = '0 auto 2rem auto';
        
        // å·¥ä¸š/ç”Ÿæ€ç«‹åœºåŒºåŸŸ
        const stanceContainer = document.createElement('div');
        stanceContainer.style.marginBottom = '1rem';
        
        // æ ‡ç­¾å®¹å™¨
        const stanceLabel = document.createElement('div');
        stanceLabel.className = 'metrics-label';
        stanceLabel.style.display = 'flex';
        stanceLabel.style.justifyContent = 'space-between';
        stanceLabel.style.marginBottom = '0.5rem';
        
        // å·¦ä¾§æ ‡ç­¾ - å·¥ä¸š
        const industrialLabel = document.createElement('span');
        industrialLabel.textContent = 'Industrial Stance';
        industrialLabel.style.fontWeight = '500';
        industrialLabel.style.color = '#4B5563';
        
        // å³ä¾§æ ‡ç­¾ - ç”Ÿæ€
        const ecologicalLabel = document.createElement('span');
        ecologicalLabel.textContent = 'Ecological Stance';
        ecologicalLabel.style.fontWeight = '500';
        ecologicalLabel.style.color = '#4B5563';
        
        stanceLabel.appendChild(industrialLabel);
        stanceLabel.appendChild(ecologicalLabel);
        
        // è¿›åº¦æ¡å®¹å™¨
        const stanceBar = document.createElement('div');
        stanceBar.className = 'metrics-bar';
        stanceBar.style.position = 'relative';
        stanceBar.style.height = '2rem';
        stanceBar.style.backgroundColor = '#F3F4F6';
        stanceBar.style.borderRadius = '9999px';
        stanceBar.style.overflow = 'hidden';
        stanceBar.style.border = '1px solid #D1D5DB';
        stanceBar.style.boxShadow = 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)';
        
        // ä¸­å¿ƒçº¿
        const centerLine = document.createElement('div');
        centerLine.className = 'metrics-bar-center';
        centerLine.style.position = 'absolute';
        centerLine.style.height = '100%';
        centerLine.style.width = '0.125rem';
        centerLine.style.backgroundColor = '#D1D5DB';
        centerLine.style.left = '50%';
        centerLine.style.transform = 'translateX(-50%)';
        centerLine.style.zIndex = '10';
        stanceBar.appendChild(centerLine);
        
        // å·¥ä¸šåŒºåŸŸ
        const industrialZone = document.createElement('div');
        industrialZone.className = 'metrics-bar-industrial';
        industrialZone.style.position = 'absolute';
        industrialZone.style.height = '100%';
        industrialZone.style.backgroundColor = '#3B82F6';
        industrialZone.style.left = '0';
        industrialZone.style.width = `${stanceToBarWidth(industrialPosition)}%`;
        industrialZone.style.transition = 'width 1s ease-in-out';
        
        // ç”Ÿæ€åŒºåŸŸ
        const ecologicalZone = document.createElement('div');
        ecologicalZone.className = 'metrics-bar-ecological';
        ecologicalZone.style.position = 'absolute';
        ecologicalZone.style.height = '100%';
        ecologicalZone.style.backgroundColor = '#22C55E'; // æ›´é«˜çº§ç»¿è‰²
        ecologicalZone.style.right = '0';
        ecologicalZone.style.width = `${stanceToBarWidth(ecologicalPosition)}%`;
        ecologicalZone.style.transition = 'width 1s ease-in-out';
        
        // æ•°å€¼æ ‡ç­¾å®¹å™¨
        const stanceValues = document.createElement('div');
        stanceValues.className = 'metrics-value';
        stanceValues.style.position = 'absolute';
        stanceValues.style.inset = '0';
        stanceValues.style.display = 'flex';
        stanceValues.style.alignItems = 'center';
        stanceValues.style.justifyContent = 'space-between';
        stanceValues.style.padding = '0 0.75rem';
        
        // å·¥ä¸šæ•°å€¼
        const industrialValue = document.createElement('span');
        industrialValue.textContent = `${Math.round(industrialPosition)}%`;
        industrialValue.style.fontSize = '0.75rem';
        industrialValue.style.fontWeight = '700';
        industrialValue.style.color = 'white';
        industrialValue.style.opacity = industrialPosition > 8 ? '1' : '0';
        industrialValue.style.transition = 'opacity 0.5s';
        
        // ç”Ÿæ€æ•°å€¼
        const ecologicalValue = document.createElement('span');
        ecologicalValue.textContent = `${Math.round(ecologicalPosition)}%`;
        ecologicalValue.style.fontSize = '0.75rem';
        ecologicalValue.style.fontWeight = '700';
        ecologicalValue.style.color = 'white';
        ecologicalValue.style.opacity = ecologicalPosition > 8 ? '1' : '0';
        ecologicalValue.style.transition = 'opacity 0.5s';
        
        // ç»„è£…è¿›åº¦æ¡
        stanceValues.appendChild(industrialValue);
        stanceValues.appendChild(ecologicalValue);
        
        stanceBar.appendChild(industrialZone);
        stanceBar.appendChild(ecologicalZone);
        stanceBar.appendChild(stanceValues);
        
        // ç»„è£…æŒ‡æ ‡åŒºåŸŸ
        stanceContainer.appendChild(stanceLabel);
        stanceContainer.appendChild(stanceBar);
        
        metricsContainer.appendChild(stanceContainer);
        
        // å¹´ä»½ä¿¡æ¯
        const yearInfo = document.createElement('div');
        yearInfo.style.textAlign = 'center';
        yearInfo.style.marginBottom = '1rem';
        yearInfo.style.color = '#4B5563';
        yearInfo.style.fontWeight = '500';
        yearInfo.textContent = `Current Year: ${gameState.gameMetrics.year}`;
        
        outerContainer.appendChild(metricsContainer);
        outerContainer.appendChild(yearInfo);
        
        // æ ‡é¢˜
        const title = document.createElement('h1');
        title.textContent = 'Record Event Card Draw';
        title.style.marginBottom = '2rem';
        title.style.textAlign = 'center';
        outerContainer.appendChild(title);

        // çŽ©å®¶èŒä¸šå¡ç‰‡åŒº
        const playerGrid = document.createElement('div');
        playerGrid.style.display = 'flex';
        playerGrid.style.justifyContent = 'center';
        playerGrid.style.gap = '1.2rem';
        playerGrid.style.marginBottom = '3rem';
        playerGrid.style.flexWrap = 'wrap';

        // NEXT YEARæŒ‰é’®
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'NEXT YEAR';
        nextBtn.className = gameState.recordEventDrawn.every(v => v) ? 'btn btn-primary btn-large' : 'btn btn-disabled btn-large';
        nextBtn.disabled = !gameState.recordEventDrawn.every(v => v);
        nextBtn.style.marginTop = '2rem';
        nextBtn.style.minWidth = '180px'; // ç¼©çŸ­æŒ‰é’®å®½åº¦
        nextBtn.style.width = 'auto';
        nextBtn.style.paddingLeft = '2rem';
        nextBtn.style.paddingRight = '2rem';
        
        // æ·»åŠ æ›´ä¸æ»‘çš„æŒ‰é’®åŠ¨ç”»æ•ˆæžœ
        nextBtn.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, background 0.3s ease';
        nextBtn.addEventListener('mouseover', () => {
            if (!nextBtn.disabled) {
                nextBtn.style.transform = 'translateY(-5px) scale(1.05)';
                nextBtn.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.25)';
            }
        });
        nextBtn.addEventListener('mouseout', () => {
            if (!nextBtn.disabled) {
                nextBtn.style.transform = 'translateY(0) scale(1)';
                nextBtn.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
            }
        });
        nextBtn.addEventListener('mousedown', () => {
            if (!nextBtn.disabled) {
                nextBtn.style.transform = 'translateY(0) scale(0.97)';
                nextBtn.style.boxShadow = '0 2px 6px rgba(59, 130, 246, 0.12)';
            }
        });
        nextBtn.addEventListener('mouseup', () => {
            if (!nextBtn.disabled) {
                nextBtn.style.transform = 'translateY(-5px) scale(1.05)';
                nextBtn.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.25)';
            }
        });
        
        nextBtn.addEventListener('click', () => {
            if (!gameState.recordEventDrawn.every(v => v)) return;
            if (gameState.gameMetrics.year < 10) {
                gameState.gameMetrics.year += 1;
                gameState.factShown = false;
                gameState.selectedOption = null;
                gameState.currentEvent = eventsData.find(e => e.year === gameState.gameMetrics.year);
                if (!gameState.currentEvent) {
                    gameState.gameMetrics.year = 1;
                    gameState.currentEvent = eventsData.find(e => e.year === gameState.gameMetrics.year);
                }
                transitionToScreen('main-game');
            } else {
                // ç¬¬åå¹´ç»“æŸåŽï¼Œæ˜¾ç¤ºç»“å±€ç”»é¢
                renderGameEndScreen();
            }
        });

        // æ·»åŠ çŽ©å®¶å¡ç‰‡
        gameState.selectedCharacters.forEach((charId, idx) => {
            const character = characters.find(c => c.id === charId);
            const card = document.createElement('div');
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.alignItems = 'center';
            card.style.width = '170px';
            card.style.margin = '0 0.5rem';

            // èŒä¸šå
            const name = document.createElement('div');
            name.textContent = character.name;
            name.style.marginBottom = '1.2rem';
            name.style.fontWeight = '500';
            name.style.fontSize = '1.15rem';
            name.style.textAlign = 'center';

            // å¤–åœˆdiv
            const iconOuter = document.createElement('div');
            iconOuter.style.width = '100px';
            iconOuter.style.height = '100px';
            iconOuter.style.borderRadius = '50%';
            iconOuter.style.backgroundColor = '#DBEAFE';
            iconOuter.style.display = 'flex';
            iconOuter.style.justifyContent = 'center';
            iconOuter.style.alignItems = 'center';
            iconOuter.style.marginBottom = '2.2rem';
            iconOuter.style.transition = 'box-shadow 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
            iconOuter.style.boxShadow = '0 4px 16px 0 rgba(59,130,246,0.10)';
            iconOuter.style.cursor = 'pointer';
            
            // å¢žå¼ºæ‚¬åœåŠ¨ç”»æ•ˆæžœ
            iconOuter.addEventListener('mouseover', () => {
                iconOuter.style.transform = 'translateY(-8px) scale(1.08)';
                iconOuter.style.boxShadow = '0 12px 28px 0 rgba(59,130,246,0.22)';
            });
            iconOuter.addEventListener('mouseout', () => {
                iconOuter.style.transform = 'none';
                iconOuter.style.boxShadow = '0 4px 16px 0 rgba(59,130,246,0.10)';
            });
            
            // ç‚¹å‡»æ•ˆæžœ
            iconOuter.addEventListener('mousedown', () => {
                iconOuter.style.transform = 'translateY(-4px) scale(0.98)';
                iconOuter.style.boxShadow = '0 6px 16px 0 rgba(59,130,246,0.15)';
            });
            iconOuter.addEventListener('mouseup', () => {
                iconOuter.style.transform = 'translateY(-8px) scale(1.08)';
                iconOuter.style.boxShadow = '0 12px 28px 0 rgba(59,130,246,0.22)';
            });

            // iconæœ¬ä½“
            const icon = document.createElement('div');
            icon.style.width = '80px';
            icon.style.height = '80px';
            icon.style.borderRadius = '50%';
            icon.style.display = 'flex';
            icon.style.alignItems = 'center';
            icon.style.justifyContent = 'center';
            icon.style.fontSize = '4rem';
            icon.style.color = 'white';
            icon.style.overflow = 'hidden';
            if (SVG_ICONS[character.id]) {
                icon.innerHTML = SVG_ICONS[character.id];
                const svg = icon.querySelector('svg');
                if (svg) {
                    svg.setAttribute('width', '100%');
                    svg.setAttribute('height', '100%');
                    svg.style.display = 'block';
                    svg.style.margin = '0';
                }
            } else {
                icon.textContent = character.icon;
            }
            iconOuter.appendChild(icon);

            // DRAWNæŒ‰é’®
            const btn = document.createElement('button');
            btn.className = '';
            btn.textContent = 'DRAWN';
            btn.disabled = !!gameState.recordEventDrawn[idx];
            btn.style.marginTop = '1.2rem';
            btn.style.width = '120px';
            btn.style.height = '44px';
            btn.style.fontSize = '1.08rem';
            btn.style.border = 'none';
            btn.style.borderRadius = '22px';
            btn.style.background = btn.disabled ? 'linear-gradient(90deg, #cbd5e1 0%, #e0e7ef 100%)' : 'linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)';
            btn.style.color = btn.disabled ? '#6b7280' : '#fff';
            btn.style.fontWeight = '600';
            btn.style.letterSpacing = '0.04em';
            btn.style.boxShadow = btn.disabled ? 'none' : '0 2px 8px 0 rgba(59,130,246,0.10)';
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'center';
            btn.style.transition = 'background 0.3s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s, box-shadow 0.3s, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
            btn.style.cursor = btn.disabled ? 'not-allowed' : 'pointer';
            
            // å¢žå¼ºæŒ‰é’®çš„æ‚¬åœåŠ¨ç”»æ•ˆæžœ
            btn.addEventListener('mouseover', () => {
                if (!btn.disabled) {
                    btn.style.background = 'linear-gradient(90deg, #2563EB 0%, #3B82F6 100%)';
                    btn.style.transform = 'translateY(-4px) scale(1.05)';
                    btn.style.boxShadow = '0 8px 20px 0 rgba(59,130,246,0.18)';
                }
            });
            btn.addEventListener('mouseout', () => {
                if (!btn.disabled) {
                    btn.style.background = 'linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)';
                    btn.style.transform = 'none';
                    btn.style.boxShadow = '0 2px 8px 0 rgba(59,130,246,0.10)';
                }
            });
            btn.addEventListener('mousedown', () => {
                if (!btn.disabled) {
                    btn.style.transform = 'scale(0.96)';
                    btn.style.boxShadow = '0 1px 4px 0 rgba(59,130,246,0.15)';
                }
            });
            btn.addEventListener('mouseup', () => {
                if (!btn.disabled) {
                    btn.style.transform = 'scale(1.04)';
                }
            });
            btn.addEventListener('click', () => {
                if (btn.disabled) return;
                
                // ç‚¹å‡»åŠ¨ç”»æ•ˆæžœ
                btn.style.transform = 'scale(1.15)';
                btn.style.boxShadow = '0 12px 24px 0 rgba(59,130,246,0.25)';
                
                setTimeout(() => {
                    gameState.recordEventDrawn[idx] = true;
                    
                    // å¹³æ»‘è¿‡æ¸¡åˆ°ç¦ç”¨çŠ¶æ€
                    const transitionDuration = 400; // æ¯«ç§’
                    
                    // åˆ›å»ºåŠ¨ç”»
                    btn.style.transition = `background 0.4s ease, color 0.4s ease, box-shadow 0.4s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)`;
                    btn.style.transform = 'scale(1)';
                    btn.style.boxShadow = '0 2px 6px rgba(59, 130, 246, 0.08)';
                    
                    // å»¶è¿Ÿè®¾ç½®disabledå±žæ€§ï¼Œè®©è¿‡æ¸¡åŠ¨ç”»å®Œæˆ
                    setTimeout(() => {
                        btn.disabled = true;
                        btn.style.background = 'linear-gradient(90deg, #cbd5e1 0%, #e0e7ef 100%)';
                        btn.style.color = '#6b7280';
                        btn.style.cursor = 'not-allowed';
                        btn.style.boxShadow = 'none';
                        
                        // æ£€æŸ¥æ˜¯å¦å…¨éƒ¨å®Œæˆï¼Œæ¿€æ´»NEXT YEARæŒ‰é’®
                        if (gameState.recordEventDrawn.every(v => v)) {
                            nextBtn.disabled = false;
                            nextBtn.className = 'btn btn-primary btn-large';
                            
                            // æ·»åŠ å®Œæˆæ•ˆæžœåŠ¨ç”»
                            nextBtn.style.transform = 'scale(1.1)';
                            nextBtn.style.boxShadow = '0 12px 24px rgba(59, 130, 246, 0.25)';
                            
                            // æŒ¯åŠ¨æ•ˆæžœ
                            setTimeout(() => {
                                if (!nextBtn.disabled) {
                                    nextBtn.style.transform = 'scale(1.15)';
                                    nextBtn.style.boxShadow = '0 14px 28px rgba(59, 130, 246, 0.3)';
                                    
                                    setTimeout(() => {
                                        if (!nextBtn.disabled) {
                                            nextBtn.style.transform = 'scale(1.05)';
                                            nextBtn.style.boxShadow = '0 8px 16px rgba(59, 130, 246, 0.2)';
                                            
                                            setTimeout(() => {
                                                if (!nextBtn.disabled) {
                                                    nextBtn.style.transform = 'scale(1)';
                                                    nextBtn.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
                                                }
                                            }, 150);
                                        }
                                    }, 150);
                                }
                            }, 100);
                        }
                    }, transitionDuration);
                }, 200);
            });

            card.appendChild(name);
            card.appendChild(iconOuter);
            card.appendChild(btn);
            playerGrid.appendChild(card);
        });

        outerContainer.appendChild(playerGrid);
        outerContainer.appendChild(nextBtn);
    }

    // æ–°å¢žï¼šè‡ªå®šä¹‰æ¸¸æˆç»“æŸå¼¹çª—
    function showGameOverModal() {
        const gameContainer = document.getElementById('game-container');
        // ç§»é™¤å·²æœ‰modal
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) gameContainer.removeChild(existingModal);

        // åˆ›å»ºmodal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.style.position = 'fixed';
        modalOverlay.style.inset = '0';
        modalOverlay.style.display = 'flex';
        modalOverlay.style.alignItems = 'center';
        modalOverlay.style.justifyContent = 'center';
        modalOverlay.style.zIndex = '100';
        modalOverlay.style.background = 'rgba(17, 24, 39, 0.7)';
        modalOverlay.style.backdropFilter = 'blur(8px)';
        modalOverlay.style.transition = 'all 0.6s cubic-bezier(0.4,0,0.2,1)';
        modalOverlay.style.opacity = '0';

        // modalå†…å®¹
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.maxWidth = '30rem';
        modalContent.style.width = '90%';
        modalContent.style.margin = '0 1rem';
        modalContent.style.textAlign = 'center';
        modalContent.style.padding = '3rem 2.5rem';
        modalContent.style.borderRadius = '1.5rem';
        modalContent.style.background = 'white';
        modalContent.style.boxShadow = '0 25px 50px -12px rgba(0,0,0,0.5)';
        modalContent.style.display = 'flex';
        modalContent.style.flexDirection = 'column';
        modalContent.style.alignItems = 'center';
        modalContent.style.gap = '1.5rem';
        modalContent.style.transform = 'scale(0.92) translateY(30px)';
        modalContent.style.opacity = '0';
        modalContent.style.transition = 'all 0.5s cubic-bezier(0.4,0,0.2,1)';
        modalContent.style.border = '2px solid rgba(59,130,246,0.15)';

        // å›¾æ ‡
        const icon = document.createElement('div');
        icon.style.fontSize = '4rem';
        icon.style.marginBottom = '0.5rem';
        icon.style.color = '#3B82F6';
        icon.textContent = 'ðŸŒŠ';

        // æ ‡é¢˜
        const title = document.createElement('h2');
        title.textContent = 'Your city is facing extreme conditions';
        title.style.color = '#2563EB';
        title.style.fontWeight = '700';
        title.style.fontSize = '1.75rem';
        title.style.margin = '0';
        title.style.lineHeight = '1.4';

        // å†…å®¹
        const desc = document.createElement('p');
        desc.textContent = 'One of your stance values has reached an extreme level of 100%. How would you like to proceed?';
        desc.style.color = '#4B5563';
        desc.style.fontSize = '1.1rem';
        desc.style.margin = '0';
        desc.style.lineHeight = '1.6';

        // æŒ‰é’®å®¹å™¨
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.flexDirection = 'column';
        buttonContainer.style.gap = '1rem';
        buttonContainer.style.width = '100%';
        buttonContainer.style.marginTop = '1rem';

        // ç»§ç»­æ¸¸æˆæŒ‰é’®
        const continueBtn = document.createElement('button');
        continueBtn.className = 'btn btn-primary btn-large';
        continueBtn.textContent = 'Continue with Reset Credit ( 0 )';
        continueBtn.style.width = '100%';
        continueBtn.style.padding = '1rem';
        continueBtn.style.transition = 'all 0.3s ease';
        continueBtn.addEventListener('mouseover', () => {
            continueBtn.style.transform = 'scale(1.05)';
            continueBtn.style.boxShadow = '0 4px 12px 0 rgba(59,130,246,0.15)';
        });
        continueBtn.addEventListener('mouseout', () => {
            continueBtn.style.transform = 'scale(1)';
            continueBtn.style.boxShadow = 'none';
        });
        continueBtn.addEventListener('mousedown', () => {
            continueBtn.style.transform = 'scale(0.97)';
        });
        continueBtn.addEventListener('mouseup', () => {
            continueBtn.style.transform = 'scale(1.05)';
        });
        continueBtn.addEventListener('click', () => {
            gameState.gameMetrics.industrialStance = 0;
            gameState.gameMetrics.ecologicalStance = 0;
            gameContainer.removeChild(modalOverlay);
            renderScreen('main-game');
        });

        // é‡æ–°å¼€å§‹æŒ‰é’®
        const restartBtn = document.createElement('button');
        restartBtn.className = 'btn btn-outline btn-medium';
        restartBtn.textContent = 'Restart New Adventure';
        restartBtn.style.width = '100%';
        restartBtn.style.padding = '1rem';
        restartBtn.style.backgroundColor = 'transparent';
        restartBtn.style.color = '#3B82F6';
        restartBtn.style.border = '2px solid #3B82F6';
        restartBtn.style.transition = 'all 0.3s ease';
        restartBtn.addEventListener('mouseover', () => {
            restartBtn.style.backgroundColor = '#EFF6FF';
            restartBtn.style.transform = 'scale(1.05)';
            restartBtn.style.boxShadow = '0 4px 12px 0 rgba(59,130,246,0.1)';
        });
        restartBtn.addEventListener('mouseout', () => {
            restartBtn.style.backgroundColor = 'transparent';
            restartBtn.style.transform = 'scale(1)';
            restartBtn.style.boxShadow = 'none';
        });
        restartBtn.addEventListener('mousedown', () => {
            restartBtn.style.transform = 'scale(0.97)';
        });
        restartBtn.addEventListener('mouseup', () => {
            restartBtn.style.transform = 'scale(1.05)';
        });
        restartBtn.addEventListener('click', () => {
            // å®Œå…¨é‡ç½®æ¸¸æˆçŠ¶æ€
            window.location.reload();
        });

        buttonContainer.appendChild(continueBtn);
        buttonContainer.appendChild(restartBtn);
        
        modalContent.appendChild(icon);
        modalContent.appendChild(title);
        modalContent.appendChild(desc);
        modalContent.appendChild(buttonContainer);
        modalOverlay.appendChild(modalContent);
        gameContainer.appendChild(modalOverlay);

        // åŠ¨ç”»æ·¡å…¥
        setTimeout(() => {
            modalOverlay.style.opacity = '1';
            modalContent.style.opacity = '1';
            modalContent.style.transform = 'scale(1) translateY(0)';
        }, 30);
    }

    // æ–°å¢žï¼šç¾Žè§‚çš„æ¸¸æˆç»“æŸé¡µé¢
    function renderGameEndScreen() {
        const gameContainer = document.getElementById('game-container');
        // æ¸…ç©ºå†…å®¹
        while (gameContainer.firstChild) gameContainer.removeChild(gameContainer.firstChild);

        // èŽ·å–æœ€ç»ˆçš„ç«‹åœºæ•°å€¼
        const indStance = gameState.gameMetrics.industrialStance;
        const ecoStance = gameState.gameMetrics.ecologicalStance;
        const stanceDiff = Math.abs(indStance - ecoStance);
        
        // åˆ¤æ–­ç»“å±€ç±»åž‹
        let endingType;
        let endingTitle;
        let endingColor;
        let endingDescription;
        let endingDetails;
        
        if (indStance === 0 || ecoStance === 0) {
            // ç»“å±€å››ï¼šä»»ä¸€æ–¹ä¸º0%ï¼Œè¾¾æˆIcarusç»“å±€
            endingType = "Icarus";
            endingTitle = "The Fallen City";
            endingColor = "#EF4444"; // çº¢è‰²è­¦å‘Š
            endingDescription = "Something seems off about this city...";
            endingDetails = [
                "Your city's pursuit of extremes has made it unstable and vulnerable.",
                "The one-sided development has consumed all resources and attention, creating critical weaknesses.",
                "Like Icarus flying too close to the sun, your city's ambition exceeded its capabilities.",
                "Reports indicate growing unrest and signs of imminent collapse.",
                "Historians will study this city as a cautionary tale of unbalanced priorities."
            ];
        } else if (indStance > ecoStance && stanceDiff >= 30) {
            // ç»“å±€ä¸€ï¼šINDæ¯”ECOé«˜30%ä»¥ä¸Šï¼Œè¾¾æˆå·¥ä¸šå¼ºåŸŽç»“å±€
            endingType = "Industrial Giant";
            endingTitle = "The Industrial Powerhouse";
            endingColor = "#3B82F6"; // å·¥ä¸šè“
            endingDescription = "A city where efficiency and progress shine in steel and glass...";
            endingDetails = [
                "Your coastal city has transformed into an industrial marvel, with towering factories and advanced infrastructure.",
                "Economic indicators show record growth, with the city becoming a global trade and manufacturing hub.",
                "Innovation centers attract the brightest minds, creating technological solutions that are exported worldwide.",
                "The skyline glitters with modernist architecture, while autonomous drones and vehicles navigate the busy streets.",
                "While environmental concerns remain, engineering solutions keep the worst impacts at bayâ€”for now."
            ];
        } else if (ecoStance > indStance && stanceDiff >= 30) {
            // ç»“å±€äºŒï¼šECOæ¯”INDé«˜30%ä»¥ä¸Šï¼Œè¾¾æˆè‡ªç„¶ä¹‹åŸŽç»“å±€
            endingType = "Nature's Haven";
            endingTitle = "The Ecological Sanctuary";
            endingColor = "#10B981"; // è‡ªç„¶ç»¿
            endingDescription = "A harmonious blend of civilization and thriving natural ecosystems...";
            endingDetails = [
                "Your coastal city has become renowned as an ecological wonder, where urban development respects natural boundaries.",
                "Innovative green architecture integrates seamlessly with restored coastal habitats, creating vibrant living spaces.",
                "Marine life has returned in abundance, with protected ocean zones becoming biodiversity hotspots studied worldwide.",
                "The air is clean, waterways are pristine, and citizens enjoy exceptional quality of life connected to nature.",
                "While economic growth is modest compared to industrial centers, sustainable industries provide stable prosperity."
            ];
        } else {
            // ç»“å±€ä¸‰ï¼šINDå’ŒECOå·®å€¼å°äºŽ30%ï¼Œè¾¾æˆå¹³è¡¡ä¹‹åŸŽç»“å±€
            endingType = "Equilibrium";
            endingTitle = "The Balanced Harbor";
            endingColor = "#8B5CF6"; // å¹³è¡¡ç´«
            endingDescription = "Where innovation and conservation dance in perfect harmony...";
            endingDetails = [
                "Your coastal city stands as a global model of balanced development, where technology and nature coexist.",
                "Renewable energy powers efficient industries, while smart urban planning preserves critical ecosystems.",
                "Citizens enjoy both economic opportunities and environmental amenities, creating a unique quality of life.",
                "Visitors marvel at how modern buildings incorporate green spaces and how industry operates with minimal impact.",
                "The city's success has inspired a new philosophy of development that is being adopted around the world."
            ];
        }

        // èƒŒæ™¯æ ·å¼
        gameContainer.style.background = `linear-gradient(120deg, ${endingColor}15 0%, ${endingColor}05 100%)`;
        
        // æ·»åŠ æµ·æ´‹èƒŒæ™¯
        const oceanBackground = createOceanBackground();
        gameContainer.appendChild(oceanBackground);
        
        // æ·»åŠ ç‰ˆæœ¬æ ‡è¯†
        const gameVersion = document.createElement('div');
        gameVersion.className = 'game-version';
        gameVersion.textContent = 'Ocean of Possibilities v1.0';
        gameContainer.appendChild(gameVersion);

        // å®¹å™¨
        const endContainer = document.createElement('div');
        endContainer.style.display = 'flex';
        endContainer.style.flexDirection = 'column';
        endContainer.style.alignItems = 'center';
        endContainer.style.justifyContent = 'center';
        endContainer.style.minHeight = '100vh';
        endContainer.style.width = '100%';
        endContainer.style.maxWidth = '1000px';
        endContainer.style.margin = '0 auto';
        endContainer.style.padding = '2rem';
        endContainer.style.gap = '1.5rem';
        endContainer.style.animation = 'fadeInEnd 1.5s cubic-bezier(0.4,0,0.2,1)';
        endContainer.style.position = 'relative';
        endContainer.style.zIndex = '10';
        
        // LogoåŒºåŸŸ
        const logoContainer = document.createElement('div');
        logoContainer.style.marginBottom = '2.5rem';
        logoContainer.style.display = 'flex';
        logoContainer.style.justifyContent = 'center';
        logoContainer.style.width = '100%';
        logoContainer.style.marginTop = '1rem';
        
        // æ·»åŠ logo
        const logoImg = document.createElement('div');
        logoImg.innerHTML = `<img src="logo.svg" alt="Ocean of Possibilities Logo" style="width: 120px; height: 120px; filter: drop-shadow(0 4px 8px rgba(99, 164, 245, 0.3));">`;
        logoImg.style.animation = 'floating 6s ease-in-out infinite';
        
        logoContainer.appendChild(logoImg);
        
        // æ ‡é¢˜å®¹å™¨
        const titleContainer = document.createElement('div');
        titleContainer.style.textAlign = 'center';
        titleContainer.style.marginBottom = '4rem';
        titleContainer.style.position = 'relative';
        
        // ç»“å±€æ ‡è¯†
        const endingBadge = document.createElement('div');
        endingBadge.textContent = endingType;
        endingBadge.style.backgroundColor = endingColor;
        endingBadge.style.color = 'white';
        endingBadge.style.padding = '0.4rem 1.25rem';
        endingBadge.style.borderRadius = '9999px';
        endingBadge.style.fontSize = '0.9rem';
        endingBadge.style.fontWeight = '600';
        endingBadge.style.display = 'inline-block';
        endingBadge.style.textTransform = 'uppercase';
        endingBadge.style.letterSpacing = '0.05em';
        endingBadge.style.marginBottom = '1.2rem';
        
        // æ ‡é¢˜
        const titleEl = document.createElement('h1');
        titleEl.textContent = endingTitle;
        titleEl.style.fontSize = '4rem';
        titleEl.style.fontWeight = '300';
        titleEl.style.color = endingColor;
        titleEl.style.margin = '0 0 1.2rem 0';
        titleEl.style.letterSpacing = '0.01em';
        titleEl.style.textShadow = `0 2px 10px ${endingColor}30`;
        
        // æ·»åŠ æ ‡é¢˜ä¸‹åˆ’çº¿è£…é¥°
        const titleDecoration = document.createElement('div');
        titleDecoration.style.height = '4px';
        titleDecoration.style.width = '0';
        titleDecoration.style.backgroundColor = endingColor;
        titleDecoration.style.margin = '0 auto';
        titleDecoration.style.transition = 'width 1.8s ease-in-out';
        titleDecoration.style.borderRadius = '2px';
        titleDecoration.style.marginBottom = '1.5rem';
        
        // å‰¯æ ‡é¢˜
        const subtitleEl = document.createElement('p');
        subtitleEl.textContent = endingDescription;
        subtitleEl.style.fontSize = '1.4rem';
        subtitleEl.style.color = '#4B5563';
        subtitleEl.style.margin = '0';
        subtitleEl.style.fontWeight = '400';
        subtitleEl.style.fontStyle = 'italic';
        subtitleEl.style.maxWidth = '700px';
        
        titleContainer.appendChild(endingBadge);
        titleContainer.appendChild(titleEl);
        titleContainer.appendChild(titleDecoration);
        titleContainer.appendChild(subtitleEl);
        
        // ç»“å±€æŒ‡æ ‡å®¹å™¨
        const metricsContainer = document.createElement('div');
        metricsContainer.style.display = 'flex';
        metricsContainer.style.flexDirection = 'column';
        metricsContainer.style.width = '100%';
        metricsContainer.style.maxWidth = '650px';
        metricsContainer.style.margin = '0 auto 3rem auto';
        metricsContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
        metricsContainer.style.padding = '1.8rem';
        metricsContainer.style.borderRadius = '1rem';
        metricsContainer.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.08)';
        
        // æŒ‡æ ‡æ ‡é¢˜
        const metricsTitle = document.createElement('h3');
        metricsTitle.textContent = 'Final City Metrics';
        metricsTitle.style.textAlign = 'center';
        metricsTitle.style.margin = '0 0 1.5rem 0';
        metricsTitle.style.color = endingColor;
        metricsTitle.style.fontSize = '1.4rem';
        metricsTitle.style.fontWeight = '500';
        
        // æŒ‡æ ‡æ¡
        const stanceContainer = document.createElement('div');
        stanceContainer.style.marginBottom = '1rem';
        
        const industrialLabel = document.createElement('div');
        industrialLabel.style.display = 'flex';
        industrialLabel.style.justifyContent = 'space-between';
        industrialLabel.style.marginBottom = '0.5rem';
        
        const indLabelText = document.createElement('span');
        indLabelText.textContent = 'Industrial Stance';
        indLabelText.style.fontWeight = '500';
        
        const indValueText = document.createElement('span');
        indValueText.textContent = `${Math.round(indStance)}%`;
        indValueText.style.fontWeight = '700';
        
        industrialLabel.appendChild(indLabelText);
        industrialLabel.appendChild(indValueText);
        
        const indBar = document.createElement('div');
        indBar.style.width = '100%';
        indBar.style.height = '0.85rem';
        indBar.style.backgroundColor = '#E5E7EB';
        indBar.style.borderRadius = '0.425rem';
        indBar.style.overflow = 'hidden';
        
        const indProgress = document.createElement('div');
        indProgress.style.width = '0%'; // åˆå§‹ä¸º0%ï¼Œä½¿ç”¨åŠ¨ç”»è¿‡æ¸¡
        indProgress.style.height = '100%';
        indProgress.style.backgroundColor = '#3B82F6';
        indProgress.style.borderRadius = '0.425rem';
        indProgress.style.transition = 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
        
        indBar.appendChild(indProgress);
        
        // ç”Ÿæ€æŒ‡æ ‡
        const ecologicalLabel = document.createElement('div');
        ecologicalLabel.style.display = 'flex';
        ecologicalLabel.style.justifyContent = 'space-between';
        ecologicalLabel.style.marginTop = '1.2rem';
        ecologicalLabel.style.marginBottom = '0.5rem';
        
        const ecoLabelText = document.createElement('span');
        ecoLabelText.textContent = 'Ecological Stance';
        ecoLabelText.style.fontWeight = '500';
        
        const ecoValueText = document.createElement('span');
        ecoValueText.textContent = `${Math.round(ecoStance)}%`;
        ecoValueText.style.fontWeight = '700';
        
        ecologicalLabel.appendChild(ecoLabelText);
        ecologicalLabel.appendChild(ecoValueText);
        
        const ecoBar = document.createElement('div');
        ecoBar.style.width = '100%';
        ecoBar.style.height = '0.85rem';
        ecoBar.style.backgroundColor = '#E5E7EB';
        ecoBar.style.borderRadius = '0.425rem';
        ecoBar.style.overflow = 'hidden';
        
        const ecoProgress = document.createElement('div');
        ecoProgress.style.width = '0%'; // åˆå§‹ä¸º0%ï¼Œä½¿ç”¨åŠ¨ç”»è¿‡æ¸¡
        ecoProgress.style.height = '100%';
        ecoProgress.style.backgroundColor = '#10B981';
        ecoProgress.style.borderRadius = '0.425rem';
        ecoProgress.style.transition = 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
        
        ecoBar.appendChild(ecoProgress);
        
        stanceContainer.appendChild(industrialLabel);
        stanceContainer.appendChild(indBar);
        stanceContainer.appendChild(ecologicalLabel);
        stanceContainer.appendChild(ecoBar);
        
        metricsContainer.appendChild(metricsTitle);
        metricsContainer.appendChild(stanceContainer);

        // æ ‡é¢˜å’Œæè¿°å®¹å™¨
        const contentContainer = document.createElement('div');
        contentContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
        contentContainer.style.padding = '2.5rem';
        contentContainer.style.borderRadius = '1rem';
        contentContainer.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.08)';
        contentContainer.style.width = '100%';
        contentContainer.style.maxWidth = '650px';
        contentContainer.style.margin = '0 auto';
        
        // æœªæ¥è¯¦æƒ…åˆ—è¡¨
        const detailsContainer = document.createElement('div');
        detailsContainer.style.marginBottom = '2.5rem';
        
        // è¯¦æƒ…æ ‡é¢˜
        const detailsTitle = document.createElement('h3');
        detailsTitle.textContent = 'Your City\'s Legacy';
        detailsTitle.style.fontSize = '1.4rem';
        detailsTitle.style.color = endingColor;
        detailsTitle.style.margin = '0 0 1.5rem 0';
        detailsTitle.style.textAlign = 'center';
        detailsTitle.style.fontWeight = '500';
        
        detailsContainer.appendChild(detailsTitle);
        
        // è¯¦æƒ…åˆ—è¡¨
        const detailsList = document.createElement('ul');
        detailsList.style.padding = '0';
        detailsList.style.margin = '0';
        detailsList.style.listStyleType = 'none';
        
        endingDetails.forEach(detail => {
            const item = document.createElement('li');
            item.style.margin = '0.75rem 0';
            item.style.padding = '0.75rem 0.75rem 0.75rem 2rem';
            item.style.position = 'relative';
            item.style.borderRadius = '0.5rem';
            item.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
            item.style.transition = 'all 0.3s ease';
            item.style.fontSize = '1.05rem';
            item.style.lineHeight = '1.5';
            
            // æ‚¬åœæ•ˆæžœ
            item.addEventListener('mouseover', () => {
                item.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                item.style.transform = 'translateX(5px)';
                item.style.boxShadow = `0 2px 8px 0 ${endingColor}15`;
            });
            
            item.addEventListener('mouseout', () => {
                item.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
                item.style.transform = 'translateX(0)';
                item.style.boxShadow = 'none';
            });
            
            // æ·»åŠ å°å›¾æ ‡
            const itemIcon = document.createElement('span');
            itemIcon.textContent = 'â€¢';
            itemIcon.style.position = 'absolute';
            itemIcon.style.color = endingColor;
            itemIcon.style.left = '0.75rem';
            itemIcon.style.fontWeight = 'bold';
            itemIcon.style.fontSize = '1.5rem';
            
            item.appendChild(itemIcon);
            item.appendChild(document.createTextNode(detail));
            detailsList.appendChild(item);
        });
        
        detailsContainer.appendChild(detailsList);
        
        // RESTARTæŒ‰é’®
        const restartBtn = document.createElement('button');
        restartBtn.textContent = 'NEW ADVENTURE';
        restartBtn.style.minWidth = '220px';
        restartBtn.style.height = '64px';
        restartBtn.style.fontSize = '1.1rem';
        restartBtn.style.fontWeight = '600';
        restartBtn.style.border = 'none';
        restartBtn.style.borderRadius = '32px';
        restartBtn.style.background = `linear-gradient(90deg, ${endingColor} 0%, ${endingColor}99 100%)`;
        restartBtn.style.color = 'white';
        restartBtn.style.letterSpacing = '0.04em';
        restartBtn.style.boxShadow = `0 4px 15px 0 ${endingColor}40`;
        restartBtn.style.display = 'flex';
        restartBtn.style.alignItems = 'center';
        restartBtn.style.justifyContent = 'center';
        restartBtn.style.padding = '0 2rem';
        restartBtn.style.cursor = 'pointer';
        restartBtn.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        restartBtn.style.margin = '0 auto';
        
        restartBtn.addEventListener('mouseover', () => {
            restartBtn.style.transform = 'translateY(-5px)';
            restartBtn.style.boxShadow = `0 8px 20px 0 ${endingColor}55`;
        });
        
        restartBtn.addEventListener('mouseout', () => {
            restartBtn.style.transform = 'scale(1)';
            restartBtn.style.boxShadow = `0 4px 15px 0 ${endingColor}40`;
        });
        
        restartBtn.addEventListener('mousedown', () => {
            restartBtn.style.transform = 'scale(0.97)';
        });
        
        restartBtn.addEventListener('mouseup', () => {
            restartBtn.style.transform = 'scale(1.05)';
        });
        
        restartBtn.addEventListener('click', () => {
            // é‡ç½®æ‰€æœ‰æ¸¸æˆçŠ¶æ€
            window.location.reload();
        });

        // æž„å»ºé¡µé¢
        contentContainer.appendChild(detailsContainer);
        contentContainer.appendChild(restartBtn);
        
        // åŠ¨ç”»keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInEnd {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes floating {
                0% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
                100% { transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
        
        // æœ€ç»ˆç»„è£…
        endContainer.appendChild(logoContainer);
        endContainer.appendChild(titleContainer);
        endContainer.appendChild(metricsContainer);
        endContainer.appendChild(contentContainer);
        
        gameContainer.appendChild(endContainer);
        
        // è§¦å‘åŠ¨ç”»
        setTimeout(() => {
            // æ ‡é¢˜è£…é¥°çº¿åŠ¨ç”»
            titleDecoration.style.width = '60%';
            
            // è¿›åº¦æ¡åŠ¨ç”»
            indProgress.style.width = `${indStance}%`;
            ecoProgress.style.width = `${ecoStance}%`;
        }, 300);
    }

    function createRoleIcon(role, x, y) {
        const icon = document.createElement('div');
        icon.className = 'role-icon';
        icon.style.left = `${x}px`;
        icon.style.top = `${y}px`;
        icon.style.width = '100px';
        icon.style.height = '100px';
        icon.style.display = 'flex';
        icon.style.justifyContent = 'center';
        icon.style.alignItems = 'center';
        icon.style.position = 'absolute';
        
        if (SVG_ICONS[role]) {
            // ä½¿ç”¨SVGå›¾æ ‡
            icon.innerHTML = SVG_ICONS[role];
            const svg = icon.querySelector('svg');
            if (svg) {
                svg.setAttribute('width', '100%');
                svg.setAttribute('height', '100%');
                svg.style.display = 'block';
                svg.style.margin = '0';
            }
        } else {
            const img = document.createElement('img');
            img.src = `images/${role}.png`;
            img.alt = role;
            icon.appendChild(img);
        }
        
        icon.addEventListener('click', () => selectRole(role));
        return icon;
    }

    // é€šç”¨çŽ°ä»£æŒ‰é’®æ ·å¼å‡½æ•°
    function applyModernButtonStyle(btn, {disabled = false} = {}) {
        btn.className = '';
        btn.style.minWidth = '260px';
        btn.style.height = '64px';
        btn.style.fontSize = '1.25rem';
        btn.style.fontWeight = '600';
        btn.style.border = 'none';
        btn.style.borderRadius = '32px';
        btn.style.background = disabled ? 'linear-gradient(90deg, #cbd5e1 0%, #e0e7ef 100%)' : 'linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)';
        btn.style.color = disabled ? '#6b7280' : '#fff';
        btn.style.letterSpacing = '0.04em';
        btn.style.boxShadow = disabled ? 'none' : '0 2px 12px 0 rgba(59,130,246,0.13)';
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.transition = 'background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.2s';
        btn.style.cursor = disabled ? 'not-allowed' : 'pointer';
        btn.style.padding = '0 32px';
        btn.style.whiteSpace = 'nowrap';
        btn.disabled = !!disabled;
        btn.onmouseover = () => {
            if (!btn.disabled) {
                btn.style.background = 'linear-gradient(90deg, #2563EB 0%, #3B82F6 100%)';
                btn.style.transform = 'translateY(-2px) scale(1.04)';
                btn.style.boxShadow = '0 6px 18px 0 rgba(59,130,246,0.16)';
            }
        };
        btn.onmouseout = () => {
            if (!btn.disabled) {
                btn.style.background = 'linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)';
                btn.style.transform = 'none';
                btn.style.boxShadow = '0 2px 12px 0 rgba(59,130,246,0.13)';
            }
        };
        btn.onmousedown = () => {
            if (!btn.disabled) {
                btn.style.transform = 'scale(0.97)';
            }
        };
        btn.onmouseup = () => {
            if (!btn.disabled) {
                btn.style.transform = 'scale(1.04)';
            }
        };
    }

    // å°†renderScreenå‡½æ•°æš´éœ²ä¸ºå…¨å±€å‡½æ•°
    window.renderScreen = renderScreen;
    
    // å°†showGameOverModalå‡½æ•°æš´éœ²ä¸ºå…¨å±€å‡½æ•°
    window.showGameOverModal = showGameOverModal;
});
