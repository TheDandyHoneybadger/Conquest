export const databaseCartas = [
    {
        "tipo": "General",
        "id": "CORE_001",
        "nome": "Valerius",
        "nacao": "Aethel",
        "tituloNacao": "O Protetor de Aethel",
        "descricao": "No final do seu turno, cure 1 de vida de todas as suas unidades.",
        "vida": 30,
        "arte": "images/CORE/General/CORE_001.webp",
        "efeito": "onTurnEnd:heal(1, all_friendly_units)",
        "segundaFace": {
            "nome": "Valerius, o Baluarte",
            "ataque": 1,
            "vida": 35,
            "descricao": "Suas unidades ganham +1/+1.",
            "arte": "images/CORE/General/CORE_001_face2.webp"
        },
        "condicaoTransformacao": {
            "tipo": "SOBREVIVER_DANO",
            "valor": 25,
            "custo": 3,
            "descricao": "Sobreviva a 25 de dano acumulado neste jogo."
        }
    },
    {
        "tipo": "Unidade",
        "id": "CORE_002",
        "nome": "Arconte Justiceiro",
        "nacao": "Aethel",
        "tituloNacao": "A Sentença de Aethel",
        "descricao": "Evasão, Vínculo Vital.",
        "custo": 6,
        "ataque": 5,
        "vida": 5,
        "arte": "images/CORE/Unidade/CORE_002.webp"
    },
    {
        "tipo": "Unidade",
        "id": "CORE_003",
        "nome": "Campeão de Aethel",
        "nacao": "Aethel",
        "tituloNacao": "O Valor de Aethel",
        "descricao": "Quando esta unidade ataca, ela ganha +1/+1 permanentemente.",
        "custo": 4,
        "ataque": 4,
        "vida": 4,
        "arte": "images/CORE/Unidade/CORE_003.webp",
        "efeito": "onAttack:buff(1,1,self)"
    },
    {
        "tipo": "Unidade",
        "id": "CORE_004",
        "nome": "Capitã da Vanguarda",
        "nacao": "Aethel",
        "tituloNacao": "A Liderança de Aethel",
        "descricao": "Quando outra unidade aliada entra em campo, conceda +1/+1 a essa unidade.",
        "custo": 3,
        "ataque": 3,
        "vida": 3,
        "arte": "images/CORE/Unidade/CORE_004.webp",
        "efeito": "onFriendlyUnitPlay:buff(1,1,triggering_unit)"
    },
    {
        "tipo": "Unidade",
        "id": "CORE_005",
        "nome": "Clériga do Sol",
        "nacao": "Aethel",
        "tituloNacao": "A Luz de Aethel",
        "descricao": "Ao entrar em campo, cure 2 de vida de uma unidade aliada alvo.",
        "custo": 2,
        "ataque": 2,
        "vida": 2,
        "arte": "images/CORE/Unidade/CORE_005.webp",
        "efeito": "onPlay:heal(2, target_friendly_unit)"
    },
    {
        "tipo": "Unidade",
        "id": "CORE_006",
        "nome": "Grifo Batedor",
        "nacao": "Aethel",
        "tituloNacao": "O Vento de Aethel",
        "descricao": "Evasão.",
        "custo": 2,
        "ataque": 2,
        "vida": 1,
        "arte": "images/CORE/Unidade/CORE_006.webp"
    },
    {
        "tipo": "Unidade",
        "id": "CORE_007",
        "nome": "Grifo Majestoso",
        "nacao": "Aethel",
        "tituloNacao": "O Olhar de Aethel",
        "descricao": "Evasão (Só pode ser bloqueada por unidades com Evasão).",
        "custo": 4,
        "ataque": 3,
        "vida": 4,
        "arte": "images/CORE/Unidade/CORE_007.webp"
    },
    {
        "tipo": "Unidade",
        "id": "CORE_008",
        "nome": "Hoplita Resoluto",
        "nacao": "Aethel",
        "tituloNacao": "A Muralha de Aethel",
        "descricao": "Proteger (1) (Previne a primeira fonte de dano a cada turno).",
        "custo": 3,
        "ataque": 2,
        "vida": 4,
        "arte": "images/CORE/Unidade/CORE_008.webp",
        "keywords": [
            "Proteger(1)"
        ]
    },
    {
        "tipo": "Unidade",
        "id": "CORE_009",
        "nome": "Invocadora Divina",
        "nacao": "Aethel",
        "tituloNacao": "O Chamado de Aethel",
        "descricao": "No início do seu turno, crie uma ficha de Espírito 1/1.",
        "custo": 3,
        "ataque": 1,
        "vida": 2,
        "arte": "images/CORE/Unidade/CORE_009.webp",
        "efeito": "onTurnStart:spawn(Espírito,1,1,empty_friendly_zone)"
    },
    {
        "tipo": "Unidade",
        "id": "CORE_010",
        "nome": "Paladino da Luz",
        "nacao": "Aethel",
        "tituloNacao": "A Lâmina de Aethel",
        "descricao": "Vínculo Vital (O dano causado por esta unidade também cura seu general).",
        "custo": 5,
        "ataque": 4,
        "vida": 5,
        "arte": "images/CORE/Unidade/CORE_010.webp"
    },
    {
        "tipo": "Unidade",
        "id": "CORE_011",
        "nome": "Recruta Corajoso",
        "nacao": "Aethel",
        "tituloNacao": "A Base de Aethel",
        "descricao": "Uma unidade simples, mas determinada.",
        "custo": 1,
        "ataque": 1,
        "vida": 2,
        "arte": "images/CORE/Unidade/CORE_011.webp"
    },
    {
        "tipo": "Unidade",
        "id": "CORE_012",
        "nome": "Sacerdotisa de Aethel",
        "nacao": "Aethel",
        "tituloNacao": "A Prece de Aethel",
        "descricao": "Ao entrar em campo, cure 3 de vida do seu General.",
        "custo": 2,
        "ataque": 1,
        "vida": 3,
        "arte": "images/CORE/Unidade/CORE_012.webp",
        "efeito": "onPlay:heal(3, owner_general)"
    },
    {
        "tipo": "Unidade",
        "id": "CORE_013",
        "nome": "Sentinela Leal",
        "nacao": "Aethel",
        "tituloNacao": "A Vigília de Aethel",
        "descricao": "Quando esta unidade é atacada, ela ganha +0/+2 até o final do turno.",
        "custo": 2,
        "vida": 5,
        "arte": "images/CORE/Unidade/CORE_013.webp",
        "efeito": "onDefend:tempBuff(0,2,self)"
    },
    {
        "tipo": "Ação",
        "id": "CORE_014",
        "nome": "Benção Divina",
        "nacao": "Aethel",
        "tituloNacao": "Decreto de Aethel",
        "descricao": "Concede +2/+2 a uma unidade aliada alvo.",
        "custo": 3,
        "arte": "images/CORE/Ação/CORE_014.webp",
        "efeito": "onPlay:buff(2, 2, target_friendly_unit)"
    },
    {
        "tipo": "Ação",
        "id": "CORE_015",
        "nome": "Escudo Sagrado",
        "nacao": "Aethel",
        "tituloNacao": "Proteção de Aethel",
        "descricao": "Concede Proteger(1) a uma unidade aliada alvo.",
        "custo": 1,
        "arte": "images/CORE/Ação/CORE_015.webp",
        "efeito": "onPlay:addKeyword(Proteger(1),target_friendly_unit)"
    },
    {
        "tipo": "Ação",
        "id": "CORE_016",
        "nome": "Intervenção Divina",
        "nacao": "Aethel",
        "tituloNacao": "Graça de Aethel",
        "descricao": "Cure 5 de vida do seu General.",
        "custo": 2,
        "arte": "images/CORE/Ação/CORE_016.webp",
        "efeito": "onPlay:heal(5, owner_general)"
    },
    {
        "tipo": "Ação",
        "id": "CORE_017",
        "nome": "Julgamento Divino",
        "nacao": "Aethel",
        "tituloNacao": "Fúria de Aethel",
        "descricao": "Destrói uma unidade inimiga alvo.",
        "custo": 5,
        "arte": "images/CORE/Ação/CORE_017.webp",
        "efeito": "onPlay:destroy(target_enemy_unit)"
    },
    {
        "tipo": "Ação",
        "id": "CORE_018",
        "nome": "Unir as Tropas",
        "nacao": "Aethel",
        "tituloNacao": "Ordem de Aethel",
        "descricao": "Concede +1/+1 a todas as suas unidades.",
        "custo": 4,
        "arte": "images/CORE/Ação/CORE_018.webp",
        "efeito": "onPlay:buff(1,1,all_friendly_units)"
    },
    {
        "tipo": "Suporte",
        "id": "CORE_019",
        "nome": "Altar da Honra",
        "nacao": "Aethel",
        "tituloNacao": "Legado de Aethel",
        "descricao": "Quando uma unidade aliada morre, concede +1/+1 a uma unidade aliada aleatória.",
        "custo": 2,
        "arte": "images/CORE/Suporte/CORE_019.webp",
        "efeito": "onFriendlyUnitDeath:buff(1,1,random_friendly_unit)"
    },
    {
        "tipo": "Suporte",
        "id": "CORE_020",
        "nome": "Monolito de Luz",
        "nacao": "Aethel",
        "tituloNacao": "Fé de Aethel",
        "descricao": "No final do seu turno, cure 2 de vida de todas as suas unidades.",
        "custo": 5,
        "arte": "images/CORE/Suporte/CORE_020.webp",
        "efeito": "onTurnEnd:heal(2,all_friendly_units)"
    },
    {
        "tipo": "Suporte",
        "id": "CORE_021",
        "nome": "Santuário Protetor",
        "nacao": "Aethel",
        "tituloNacao": "Relíquia de Aethel",
        "descricao": "No início do seu turno, concede Proteger(1) a uma unidade aliada aleatória.",
        "custo": 3,
        "arte": "images/CORE/Suporte/CORE_021.webp",
        "efeito": "onTurnStart:addKeyword(Proteger(1), random_friendly_unit)"
    },
    {
        "tipo": "General",
        "id": "CORE_022",
        "nome": "Korgoth",
        "nacao": "Kragmar",
        "tituloNacao": "O Fúria de Kragmar",
        "descricao": "Quando uma unidade inimiga morre, cause 1 de dano ao General inimigo.",
        "ataque": 1,
        "vida": 28,
        "arte": "images/CORE/General/CORE_022.webp",
        "efeito": "onEnemyUnitDeath:damage(1, opponent_general)",
        "segundaFace": {
            "nome": "Korgoth, o Imparável",
            "ataque": 3,
            "vida": 30,
            "descricao": "Suas unidades ganham Ímpeto.",
            "arte": "images/CORE/General/CORE_022_face2.webp"
        },
        "condicaoTransformacao": {
            "tipo": "CAUSAR_DANO",
            "valor": 20,
            "custo": 4,
            "descricao": "Cause 20 de dano com unidades neste jogo."
        }
    },
    {
        "tipo": "Unidade",
        "id": "CORE_023",
        "nome": "Bárbaro Sedento de Sangue",
        "nacao": "Kragmar",
        "tituloNacao": "A Sede de Kragmar",
        "descricao": "Quando uma unidade inimiga morre, ganha +2 de Ataque até o final do turno.",
        "custo": 3,
        "ataque": 3,
        "vida": 3,
        "arte": "images/CORE/Unidade/CORE_023.webp",
        "efeito": "onEnemyUnitDeath:tempBuff(2,0,self)"
    },
    {
        "tipo": "Unidade",
        "id": "CORE_024",
        "nome": "Campeão da Arena",
        "nacao": "Kragmar",
        "tituloNacao": "O Desafio de Kragmar",
        "descricao": "Quando esta unidade sobrevive a dano, ganha +2 de Ataque permanentemente.",
        "custo": 3,
        "ataque": 2,
        "vida": 4,
        "arte": "images/CORE/Unidade/CORE_024.webp",
        "efeito": "onSurviveDamage:buff(2,0,self)"
    },
    {
        "tipo": "Unidade",
        "id": "CORE_025",
        "nome": "Chefe de Guerra Orc",
        "nacao": "Kragmar",
        "tituloNacao": "O Comando de Kragmar",
        "descricao": "Ao entrar em campo, suas outras unidades ganham +2 de Ataque até o final do turno.",
        "custo": 4,
        "ataque": 4,
        "vida": 3,
        "arte": "images/CORE/Unidade/CORE_025.webp",
        "efeito": "onPlay:tempBuff(2,0,all_friendly_units)"
    },
    {
        "tipo": "Unidade",
        "id": "CORE_026",
        "nome": "Cão de Guerra",
        "nacao": "Kragmar",
        "tituloNacao": "O Dente de Kragmar",
        "descricao": "Ímpeto.",
        "custo": 2,
        "ataque": 2,
        "vida": 2,
        "arte": "images/CORE/Unidade/CORE_026.webp"
    },
    {
        "tipo": "Unidade",
        "id": "CORE_027",
        "nome": "Devastador de Kragmar",
        "nacao": "Kragmar",
        "tituloNacao": "O Terremoto de Kragmar",
        "descricao": "Quando esta unidade ataca, cause 1 de dano a todas as outras unidades.",
        "custo": 5,
        "ataque": 5,
        "vida": 4,
        "arte": "images/CORE/Unidade/CORE_027.webp",
        "efeito": "onAttack:damage(1,all_units)"
    },
    {
        "id": "CORE_028",
        "nome": "Gigante das Montanhas",
        "tipo": "Unidade",
        "nacao": "Kragmar",
        "tituloNacao": "A Fúria de Kragmar",
        "custo": 6,
        "descricao": "Uma força colossal de destruição.",
        "ataque": 7,
        "vida": 6
    },
    {
        "tipo": "Unidade",
        "id": "CORE_029",
        "nome": "Goblin Atirador de Lança",
        "nacao": "Kragmar",
        "tituloNacao": "A Ponta de Kragmar",
        "descricao": "Ao entrar em campo, cause 1 de dano ao General inimigo.",
        "custo": 2,
        "ataque": 3,
        "vida": 1,
        "arte": "images/CORE/Unidade/CORE_029.webp",
        "efeito": "onPlay:damage(1, opponent_general)"
    },
    {
        "tipo": "Unidade",
        "id": "CORE_030",
        "nome": "Goblin Frenético",
        "nacao": "Kragmar",
        "tituloNacao": "O Caos de Kragmar",
        "descricao": "Ímpeto. Último Suspiro: Cause 1 de dano ao General inimigo.",
        "custo": 1,
        "ataque": 1,
        "vida": 1,
        "arte": "images/CORE/Unidade/CORE_030.webp",
        "efeito": "onDeath:damage(1, opponent_general)"
    },
    {
        "id": "CORE_031",
        "nome": "Goblin Saqueador",
        "tipo": "Unidade",
        "nacao": "Kragmar",
        "tituloNacao": "A Praga de Kragmar",
        "custo": 1,
        "descricao": "Ímpeto.",
        "ataque": 2,
        "vida": 1,
        "keywords": [
            "Ímpeto"
        ]
    },
    {
        "id": "CORE_032",
        "nome": "Incursor Orc",
        "tipo": "Unidade",
        "nacao": "Kragmar",
        "tituloNacao": "O Machado de Kragmar",
        "custo": 2,
        "descricao": "Ímpeto.",
        "ataque": 3,
        "vida": 1,
        "keywords": [
            "Ímpeto"
        ]
    },
    {
        "id": "CORE_033",
        "nome": "Ogro Esmagador",
        "tipo": "Unidade",
        "nacao": "Kragmar",
        "tituloNacao": "O Punho de Kragmar",
        "custo": 5,
        "descricao": "Uma unidade de força bruta.",
        "ataque": 6,
        "vida": 5
    },
    {
        "id": "CORE_034",
        "nome": "Piromante Goblin",
        "tipo": "Unidade",
        "nacao": "Kragmar",
        "tituloNacao": "A Chama de Kragmar",
        "custo": 3,
        "descricao": "Ao entrar em campo, cause 1 de dano a uma unidade inimiga alvo.",
        "ataque": 2,
        "vida": 2,
        "efeito": "onPlay:damage(1, target_enemy_unit)"
    },
    {
        "id": "CORE_035",
        "nome": "Wyvern Jovem",
        "tipo": "Unidade",
        "nacao": "Kragmar",
        "tituloNacao": "A Garra de Kragmar",
        "custo": 4,
        "descricao": "Ímpeto, Evasão.",
        "ataque": 3,
        "vida": 3,
        "keywords": [
            "Ímpeto",
            "Evasão"
        ]
    },
    {
        "id": "CORE_036",
        "nome": "Ataque Surpresa",
        "tipo": "Ação",
        "nacao": "Kragmar",
        "tituloNacao": "A Emboscada de Kragmar",
        "custo": 2,
        "descricao": "Concede Ímpeto a uma unidade aliada alvo.",
        "efeito": "onPlay:addKeyword(Ímpeto,target_friendly_unit)"
    },
    {
        "id": "CORE_037",
        "nome": "Grito de Guerra",
        "tipo": "Ação",
        "nacao": "Kragmar",
        "tituloNacao": "O Brado de Kragmar",
        "custo": 2,
        "descricao": "Suas unidades ganham +2 de Ataque até o final do turno.",
        "efeito": "onPlay:tempBuff(2,0,all_friendly_units)"
    },
    {
        "id": "CORE_038",
        "nome": "Lança de Magma",
        "tipo": "Ação",
        "nacao": "Kragmar",
        "tituloNacao": "A Lança de Kragmar",
        "custo": 4,
        "descricao": "Cause 4 de dano a uma unidade alvo.",
        "efeito": "onPlay:damage(4, target_unit)"
    },
    {
        "id": "CORE_039",
        "nome": "Pilhagem",
        "tipo": "Ação",
        "nacao": "Kragmar",
        "tituloNacao": "O Saque de Kragmar",
        "custo": 3,
        "descricao": "Compre 2 cartas e cause 2 de dano ao seu General.",
        "efeito": "onPlay:draw(2),damage(2,owner_general)"
    },
    {
        "id": "CORE_040",
        "nome": "Raiva Incontrolável",
        "tipo": "Ação",
        "nacao": "Kragmar",
        "tituloNacao": "Ira de Kragmar",
        "custo": 1,
        "descricao": "Concede +3/+0 a uma unidade aliada alvo até o final do turno.",
        "efeito": "onPlay:tempBuff(3, 0, target_friendly_unit)"
    },
    {
        "id": "CORE_041",
        "nome": "Estandarte de Guerra",
        "tipo": "Suporte",
        "nacao": "Kragmar",
        "tituloNacao": "O Grito de Kragmar",
        "custo": 4,
        "descricao": "Suas outras unidades entram em campo com +1 de Ataque.",
        "efeito": "onFriendlyUnitPlay:buff(1, 0, triggering_unit)"
    },
    {
        "id": "CORE_042",
        "nome": "Forja de Guerra",
        "tipo": "Suporte",
        "nacao": "Kragmar",
        "tituloNacao": "A bigorna de Kragmar",
        "custo": 3,
        "descricao": "No início do seu turno, conceda +1 de Ataque a uma unidade aliada aleatória até o final do turno.",
        "efeito": "onTurnStart:tempBuff(1,0,random_friendly_unit)"
    },
    {
        "tipo": "General",
        "id": "CORE_043",
        "nome": "Lyra",
        "nacao": "Sylvanis",
        "tituloNacao": "A Guardiã de Sylvanis",
        "descricao": "No início do seu turno, crie uma ficha de Muda 0/1 em uma zona de unidade aliada vazia.",
        "vida": 28,
        "arte": "images/CORE/General/CORE_043.webp",
        "efeito": "onTurnStart:spawn(Muda, 0, 1, empty_friendly_zone)",
        "segundaFace": {
            "nome": "Lyra, Coração da Floresta",
            "ataque": 1,
            "vida": 30,
            "descricao": "Suas outras unidades ganham +1/+1.",
            "arte": "images/CORE/General/CORE_043_face2.webp"
        },
        "condicaoTransformacao": {
            "tipo": "GANHAR_EXP",
            "valor": 8,
            "custo": 2,
            "descricao": "Atinja 8 de Experiência total."
        }
    },
    {
        "id": "CORE_044",
        "nome": "Ancião da Sabedoria",
        "tipo": "Unidade",
        "nacao": "Sylvanis",
        "tituloNacao": "A Mente de Sylvanis",
        "custo": 6,
        "descricao": "Sempre que você jogar uma unidade, compre uma carta.",
        "ataque": 4,
        "vida": 6,
        "efeito": "onFriendlyUnitPlay:draw(1)"
    },
    {
        "id": "CORE_045",
        "nome": "Aranha Teia-de-ferro",
        "tipo": "Unidade",
        "nacao": "Sylvanis",
        "tituloNacao": "A Armadilha de Sylvanis",
        "custo": 3,
        "descricao": "Toque Mortal (Qualquer dano desta unidade destrói uma criatura).",
        "ataque": 1,
        "vida": 4,
        "keywords": [
            "Toque Mortal"
        ]
    },
    {
        "id": "CORE_046",
        "nome": "Centauro Caçador",
        "tipo": "Unidade",
        "nacao": "Sylvanis",
        "tituloNacao": "O Casco de Sylvanis",
        "custo": 3,
        "descricao": "Ímpeto.",
        "ataque": 3,
        "vida": 2,
        "keywords": [
            "Ímpeto"
        ]
    },
    {
        "id": "CORE_047",
        "nome": "Colosso da Floresta",
        "tipo": "Unidade",
        "nacao": "Sylvanis",
        "tituloNacao": "A Força de Sylvanis",
        "custo": 7,
        "descricao": "Uma força antiga da natureza.",
        "ataque": 8,
        "vida": 8
    },
    {
        "id": "CORE_048",
        "nome": "Druida do Bosque",
        "tipo": "Unidade",
        "nacao": "Sylvanis",
        "tituloNacao": "A Sabedoria de Sylvanis",
        "custo": 2,
        "descricao": "Ao entrar em campo, você ganha 1 de Experiência.",
        "ataque": 1,
        "vida": 1,
        "efeito": "onPlay:gainExp(1)"
    },
    {
        "id": "CORE_049",
        "nome": "Elemental da Terra",
        "tipo": "Unidade",
        "nacao": "Sylvanis",
        "tituloNacao": "O Coração de Sylvanis",
        "custo": 5,
        "descricao": "Uma criatura massiva feita de terra e pedra.",
        "ataque": 5,
        "vida": 6
    },
    {
        "id": "CORE_050",
        "nome": "Elfo Batedor",
        "tipo": "Unidade",
        "nacao": "Sylvanis",
        "tituloNacao": "O Sussurro de Sylvanis",
        "custo": 1,
        "descricao": "Uma unidade de reconhecimento ágil.",
        "ataque": 2,
        "vida": 1
    },
    {
        "id": "CORE_051",
        "nome": "Feiticeira das Vinhas",
        "tipo": "Unidade",
        "nacao": "Sylvanis",
        "tituloNacao": "O Laço de Sylvanis",
        "custo": 4,
        "descricao": "Ao entrar em campo, destrói um Suporte inimigo alvo.",
        "ataque": 3,
        "vida": 3,
        "efeito": "onPlay:destroy(target_enemy_support)"
    },
    {
        "id": "CORE_052",
        "nome": "Guardião do Viveiro",
        "tipo": "Unidade",
        "nacao": "Sylvanis",
        "tituloNacao": "O Berçário de Sylvanis",
        "custo": 5,
        "descricao": "Quando esta unidade morre, cria duas fichas de Muda 1/1.",
        "ataque": 4,
        "vida": 4,
        "efeito": "onDeath:spawn(Muda,1,1,empty_friendly_zone),spawn(Muda,1,1,empty_friendly_zone)"
    },
    {
        "id": "CORE_053",
        "nome": "Líder da Matilha",
        "tipo": "Unidade",
        "nacao": "Sylvanis",
        "tituloNacao": "A Presa de Sylvanis",
        "custo": 3,
        "descricao": "Quando outra unidade aliada entra em campo, esta unidade ganha +1/+1.",
        "ataque": 2,
        "vida": 2,
        "efeito": "onFriendlyUnitPlay:buff(1,1,self)"
    },
    {
        "id": "CORE_054",
        "nome": "Protetor Ancestral",
        "tipo": "Unidade",
        "nacao": "Sylvanis",
        "tituloNacao": "A Casca de Sylvanis",
        "custo": 4,
        "descricao": "Proteger (1).",
        "ataque": 3,
        "vida": 5,
        "keywords": [
            "Proteger(1)"
        ]
    },
    {
        "id": "CORE_055",
        "nome": "Urso Feroz",
        "tipo": "Unidade",
        "nacao": "Sylvanis",
        "tituloNacao": "A Pata de Sylvanis",
        "custo": 3,
        "descricao": "Uma fera selvagem e resistente.",
        "ataque": 4,
        "vida": 3
    },
    {
        "id": "CORE_056",
        "nome": "Abraço da Natureza",
        "tipo": "Ação",
        "nacao": "Sylvanis",
        "tituloNacao": "A Carícia de Sylvanis",
        "custo": 2,
        "descricao": "Concede +2/+2 a uma unidade aliada alvo.",
        "efeito": "onPlay:buff(2,2,target_friendly_unit)"
    },
    {
        "id": "CORE_057",
        "nome": "Crescimento Fértil",
        "tipo": "Ação",
        "nacao": "Sylvanis",
        "tituloNacao": "O Ciclo de Sylvanis",
        "custo": 3,
        "descricao": "Você ganha 2 de Experiência.",
        "efeito": "onPlay:gainExp(2)"
    },
    {
        "id": "CORE_058",
        "nome": "Emboscada com Vinhas",
        "tipo": "Ação",
        "nacao": "Sylvanis",
        "tituloNacao": "A Garra de Sylvanis",
        "custo": 4,
        "descricao": "Destrói uma unidade inimiga com Evasão.",
        "efeito": "onPlay:destroy(target_enemy_unit_evasion)"
    },
    {
        "id": "CORE_059",
        "nome": "Força da Selva",
        "tipo": "Ação",
        "nacao": "Sylvanis",
        "tituloNacao": "A Fúria de Sylvanis",
        "custo": 6,
        "descricao": "Concede +3/+3 a todas as suas unidades.",
        "efeito": "onPlay:buff(3,3,all_friendly_units)"
    },
    {
        "id": "CORE_060",
        "nome": "Revitalizar",
        "tipo": "Ação",
        "nacao": "Sylvanis",
        "tituloNacao": "A Seiva de Sylvanis",
        "custo": 1,
        "descricao": "Cure 4 de vida de uma unidade ou General alvo.",
        "efeito": "onPlay:heal(4,target_unit)"
    },
    {
        "id": "CORE_061",
        "nome": "Círculo de Espinhos",
        "tipo": "Suporte",
        "nacao": "Sylvanis",
        "tituloNacao": "A Defesa de Sylvanis",
        "custo": 3,
        "descricao": "Quando uma unidade inimiga ataca, ela sofre 1 de dano.",
        "efeito": "onEnemyAttack:damage(1,triggering_unit)"
    },
    {
        "id": "CORE_062",
        "nome": "Florescer Ancestral",
        "tipo": "Suporte",
        "nacao": "Sylvanis",
        "tituloNacao": "O Legado de Sylvanis",
        "custo": 4,
        "descricao": "No final do seu turno, se você não atacou, ganhe 1 de EXP.",
        "efeito": "onTurnEnd:gainExp(1)"
    },
    {
        "id": "CORE_063",
        "nome": "Semente da Vida",
        "tipo": "Suporte",
        "nacao": "Sylvanis",
        "tituloNacao": "Dádiva de Sylvanis",
        "custo": 1,
        "descricao": "Quando uma unidade aliada entra em campo, cure 1 de vida do seu General.",
        "efeito": "onFriendlyUnitPlay:heal(1, owner_general)"
    },
    {
        "tipo": "General",
        "id": "CORE_064",
        "nome": "Malakor",
        "nacao": "Noxaeterna",
        "tituloNacao": "O Sussurro de Noxaeterna",
        "descricao": "Quando uma unidade aliada morre, cure 2 de vida do seu General.",
        "ataque": 1,
        "vida": 25,
        "arte": "images/CORE/General/CORE_064.webp",
        "efeito": "onFriendlyUnitDeath:heal(2, owner_general)",
        "segundaFace": {
            "nome": "Malakor, O Ceifador",
            "ataque": 2,
            "vida": 30,
            "descricao": "Quando uma unidade (aliada ou inimiga) morre, você ganha 1 de EXP.",
            "arte": "images/CORE/General/CORE_064_face2.webp"
        },
        "condicaoTransformacao": {
            "tipo": "ALIADOS_MORTOS",
            "valor": 10,
            "custo": 4,
            "descricao": "Se 10 aliados morreram neste jogo."
        }
    },
    {
        "id": "CORE_065",
        "nome": "Abominação Instável",
        "tipo": "Unidade",
        "nacao": "Noxaeterna",
        "tituloNacao": "A Praga de Noxaeterna",
        "custo": 4,
        "descricao": "Último Suspiro: Cause 1 de dano a todas as unidades.",
        "ataque": 5,
        "vida": 3,
        "efeito": "onDeath:damage(1,all_units)"
    },
    {
        "id": "CORE_066",
        "nome": "Aparição Vingativa",
        "tipo": "Unidade",
        "nacao": "Noxaeterna",
        "tituloNacao": "O Lamento de Noxaeterna",
        "custo": 3,
        "descricao": "Ressurgir (Na primeira vez que esta unidade morre, ela retorna ao campo com 1 de vida).",
        "ataque": 3,
        "vida": 2,
        "keywords": [
            "Ressurgir"
        ]
    },
    {
        "id": "CORE_067",
        "nome": "Banshee Chorosa",
        "tipo": "Unidade",
        "nacao": "Noxaeterna",
        "tituloNacao": "O Pavor de Noxaeterna",
        "custo": 3,
        "descricao": "Evasão.",
        "ataque": 3,
        "vida": 2,
        "keywords": [
            "Evasão"
        ]
    },
    {
        "id": "CORE_068",
        "nome": "Carniçal Faminto",
        "tipo": "Unidade",
        "nacao": "Noxaeterna",
        "tituloNacao": "A Fome de Noxaeterna",
        "custo": 2,
        "descricao": "Quando uma unidade inimiga morre, esta unidade ganha +1/+1.",
        "ataque": 2,
        "vida": 2,
        "efeito": "onEnemyUnitDeath:buff(1, 1, self)"
    },
    {
        "id": "CORE_069",
        "nome": "Cavaleiro do Pavor",
        "tipo": "Unidade",
        "nacao": "Noxaeterna",
        "tituloNacao": "O Terror de Noxaeterna",
        "custo": 6,
        "descricao": "Ímpeto, Vínculo Vital.",
        "ataque": 5,
        "vida": 4,
        "keywords": [
            "Ímpeto",
            "Vínculo Vital"
        ]
    },
    {
        "id": "CORE_070",
        "nome": "Ceifador de Almas",
        "tipo": "Unidade",
        "nacao": "Noxaeterna",
        "tituloNacao": "A Foice de Noxaeterna",
        "custo": 4,
        "descricao": "Toque Mortal.",
        "ataque": 2,
        "vida": 3,
        "keywords": [
            "Toque Mortal"
        ]
    },
    {
        "id": "CORE_071",
        "nome": "Espectro Agonizante",
        "tipo": "Unidade",
        "nacao": "Noxaeterna",
        "tituloNacao": "O Grito de Noxaeterna",
        "custo": 2,
        "descricao": "Último Suspiro: O oponente descarta 1 carta.",
        "ataque": 2,
        "vida": 1,
        "efeito": "onDeath:discard(1,opponent)"
    },
    {
        "id": "CORE_072",
        "nome": "Lich Acólito",
        "tipo": "Unidade",
        "nacao": "Noxaeterna",
        "tituloNacao": "O Segredo de Noxaeterna",
        "custo": 5,
        "descricao": "Último Suspiro: Cause 2 de dano a todas as unidades inimigas.",
        "ataque": 4,
        "vida": 4,
        "efeito": "onDeath:damage(2, all_enemy_units)"
    },
    {
        "id": "CORE_073",
        "nome": "Necromante Cultista",
        "tipo": "Unidade",
        "nacao": "Noxaeterna",
        "tituloNacao": "O Culto de Noxaeterna",
        "custo": 3,
        "descricao": "Quando uma unidade aliada morre, esta unidade ganha +2 de Ataque.",
        "ataque": 1,
        "vida": 3,
        "efeito": "onFriendlyUnitDeath:buff(2,0,self)"
    },
    {
        "id": "CORE_074",
        "nome": "Servo Esquelético",
        "tipo": "Unidade",
        "nacao": "Noxaeterna",
        "tituloNacao": "O Osso de Noxaeterna",
        "custo": 1,
        "descricao": "Uma unidade barata para sacrifícios.",
        "ataque": 1,
        "vida": 1
    },
    {
        "id": "CORE_075",
        "nome": "Vampiro Sanguinário",
        "tipo": "Unidade",
        "nacao": "Noxaeterna",
        "tituloNacao": "A Sede de Noxaeterna",
        "custo": 4,
        "descricao": "Vínculo Vital.",
        "ataque": 4,
        "vida": 3,
        "keywords": [
            "Vínculo Vital"
        ]
    },
    {
        "id": "CORE_076",
        "nome": "Zumbi Pestilento",
        "tipo": "Unidade",
        "nacao": "Noxaeterna",
        "tituloNacao": "A Doença de Noxaeterna",
        "custo": 1,
        "descricao": "Ressurgir.",
        "ataque": 1,
        "vida": 1,
        "keywords": [
            "Ressurgir"
        ]
    },
    {
        "id": "CORE_077",
        "nome": "Maldição Enfraquecedora",
        "tipo": "Ação",
        "nacao": "Noxaeterna",
        "tituloNacao": "A Fraqueza de Noxaeterna",
        "custo": 2,
        "descricao": "Concede -2/-2 a uma unidade inimiga alvo.",
        "efeito": "onPlay:buff(-2,-2,target_enemy_unit)"
    },
    {
        "id": "CORE_078",
        "nome": "Pacto Sombrio",
        "tipo": "Ação",
        "nacao": "Noxaeterna",
        "tituloNacao": "O Contrato de Noxaeterna",
        "custo": 1,
        "descricao": "Compre 2 cartas e perca 2 de vida.",
        "efeito": "onPlay:draw(2),damage(2,owner_general)"
    },
    {
        "id": "CORE_079",
        "nome": "Reanimar Cadáver",
        "tipo": "Ação",
        "nacao": "Noxaeterna",
        "tituloNacao": "Ritual de Noxaeterna",
        "custo": 4,
        "descricao": "Cria uma ficha de Zumbi 2/2.",
        "efeito": "onPlay:spawn(Zumbi, 2, 2, empty_friendly_zone)"
    },
    {
        "id": "CORE_080",
        "nome": "Sacrifício Ritual",
        "tipo": "Ação",
        "nacao": "Noxaeterna",
        "tituloNacao": "A Troca de Noxaeterna",
        "custo": 1,
        "descricao": "Destrua uma unidade aliada para comprar 2 cartas.",
        "efeito": "onPlay:destroy(target_friendly_unit),draw(2)"
    },
    {
        "id": "CORE_081",
        "nome": "Toque da Morte",
        "tipo": "Ação",
        "nacao": "Noxaeterna",
        "tituloNacao": "O Dedo de Noxaeterna",
        "custo": 3,
        "descricao": "Destrói uma unidade alvo.",
        "efeito": "onPlay:destroy(target_unit)"
    },
    {
        "id": "CORE_082",
        "nome": "Altar da Escuridão",
        "tipo": "Suporte",
        "nacao": "Noxaeterna",
        "tituloNacao": "O Poder de Noxaeterna",
        "custo": 4,
        "descricao": "Quando uma unidade sua morre, cause 1 de dano ao General inimigo.",
        "efeito": "onFriendlyUnitDeath:damage(1,opponent_general)"
    },
    {
        "id": "CORE_083",
        "nome": "Cripta Profana",
        "tipo": "Suporte",
        "nacao": "Noxaeterna",
        "tituloNacao": "O Repouso de Noxaeterna",
        "custo": 2,
        "descricao": "No final do seu turno, se uma unidade aliada morreu, compre uma carta.",
        "efeito": "onTurnEnd:draw(1)"
    },
    {
        "id": "CORE_084",
        "nome": "Poço de Almas",
        "tipo": "Suporte",
        "nacao": "Noxaeterna",
        "tituloNacao": "O Poço de Noxaeterna",
        "custo": 3,
        "descricao": "No início do seu turno, se você não tem unidades, crie um Zumbi 1/1.",
        "efeito": "onTurnStart:spawn(Zumbi,1,1,empty_friendly_zone)"
    },
    {
        "tipo": "General",
        "id": "CORE_085",
        "nome": "Syren",
        "nacao": "Leviathus",
        "tituloNacao": "A Vontade Salgada de Leviathus",
        "descricao": "No final do seu turno, compre uma carta.",
        "vida": 28,
        "arte": "images/CORE/General/CORE_085.webp",
        "efeito": "onTurnEnd:draw(1)",
        "segundaFace": {
            "nome": "Syren, Rainha das Marés",
            "ataque": 1,
            "vida": 32,
            "descricao": "O custo de suas cartas de Ação é reduzido em 1.",
            "arte": "images/CORE/General/CORE_085_face2.webp"
        },
        "condicaoTransformacao": {
            "tipo": "COMPRAR_CARTAS",
            "valor": 12,
            "custo": 3,
            "descricao": "Compre 12 cartas neste jogo."
        }
    },
    {
        "id": "CORE_086",
        "nome": "Defensor de Atlântida",
        "tipo": "Unidade",
        "nacao": "Leviathus",
        "tituloNacao": "A Guarda de Leviathus",
        "custo": 3,
        "descricao": "Proteger (1).",
        "ataque": 2,
        "vida": 4,
        "keywords": [
            "Proteger(1)"
        ]
    },
    {
        "id": "CORE_087",
        "nome": "Elemental da Água",
        "tipo": "Unidade",
        "nacao": "Leviathus",
        "tituloNacao": "A Gota de Leviathus",
        "custo": 2,
        "descricao": "Quando você joga uma Ação, esta unidade ganha +1/+1.",
        "ataque": 1,
        "vida": 2,
        "efeito": "onOwnerPlayAction:buff(1,1,self)"
    },
    {
        "id": "CORE_088",
        "nome": "Espião Tritão",
        "tipo": "Unidade",
        "nacao": "Leviathus",
        "tituloNacao": "O Segredo de Leviathus",
        "custo": 1,
        "descricao": "Evasão.",
        "ataque": 1,
        "vida": 1,
        "keywords": [
            "Evasão"
        ]
    },
    {
        "id": "CORE_089",
        "nome": "Fantasma do Naufrágio",
        "tipo": "Unidade",
        "nacao": "Leviathus",
        "tituloNacao": "O Lamento de Leviathus",
        "custo": 2,
        "descricao": "Evasão.",
        "ataque": 2,
        "vida": 2,
        "keywords": [
            "Evasão"
        ]
    },
    {
        "id": "CORE_090",
        "nome": "Guardião do Coral",
        "tipo": "Unidade",
        "nacao": "Leviathus",
        "tituloNacao": "A Barreira de Leviathus",
        "custo": 4,
        "descricao": "Proteger (2).",
        "ataque": 2,
        "vida": 5,
        "keywords": [
            "Proteger(2)"
        ]
    },
    {
        "id": "CORE_091",
        "nome": "Kraken Ancião",
        "tipo": "Unidade",
        "nacao": "Leviathus",
        "tituloNacao": "A Fúria de Leviathus",
        "custo": 8,
        "descricao": "Ao entrar em campo, devolve todas as outras unidades para a mão de seus donos.",
        "ataque": 8,
        "vida": 8,
        "efeito": "onPlay:returnToHand(all_units)"
    },
    {
        "id": "CORE_092",
        "nome": "Leviatã Colossal",
        "tipo": "Unidade",
        "nacao": "Leviathus",
        "tituloNacao": "O Tsunami de Leviathus",
        "custo": 9,
        "descricao": "Evasão, Proteger (2).",
        "ataque": 9,
        "vida": 9,
        "keywords": [
            "Evasão",
            "Proteger(2)"
        ]
    },
    {
        "id": "CORE_093",
        "nome": "Mago das Correntes",
        "tipo": "Unidade",
        "nacao": "Leviathus",
        "tituloNacao": "A Prisão de Leviathus",
        "custo": 4,
        "descricao": "Ao entrar em campo, uma unidade inimiga alvo perde suas habilidades.",
        "ataque": 3,
        "vida": 3,
        "efeito": "onPlay:removeKeywords(target_enemy_unit)"
    },
    {
        "id": "CORE_094",
        "nome": "Serpente Marinha",
        "tipo": "Unidade",
        "nacao": "Leviathus",
        "tituloNacao": "O Bote de Leviathus",
        "custo": 3,
        "descricao": "Evasão.",
        "ataque": 3,
        "vida": 2,
        "keywords": [
            "Evasão"
        ]
    },
    {
        "id": "CORE_095",
        "nome": "Sirena Encantadora",
        "tipo": "Unidade",
        "nacao": "Leviathus",
        "tituloNacao": "A Maré de Leviathus",
        "custo": 3,
        "descricao": "Ao entrar em campo, devolve uma unidade inimiga alvo para a mão de seu dono.",
        "ataque": 2,
        "vida": 3,
        "efeito": "onPlay:returnToHand(target_enemy_unit)"
    },
    {
        "id": "CORE_096",
        "nome": "Verme das Profundezas",
        "tipo": "Unidade",
        "nacao": "Leviathus",
        "tituloNacao": "O Abismo de Leviathus",
        "custo": 6,
        "descricao": "Evasão.",
        "ataque": 6,
        "vida": 6,
        "keywords": [
            "Evasão"
        ]
    },
    {
        "id": "CORE_097",
        "nome": "Vidente das Marés",
        "tipo": "Unidade",
        "nacao": "Leviathus",
        "tituloNacao": "A Visão de Leviathus",
        "custo": 2,
        "descricao": "Ao entrar em campo, compre uma carta.",
        "ataque": 1,
        "vida": 1,
        "efeito": "onPlay:draw(1)"
    },
    {
        "id": "CORE_098",
        "nome": "Congelamento Súbito",
        "tipo": "Ação",
        "nacao": "Leviathus",
        "tituloNacao": "O Gelo de Leviathus",
        "custo": 1,
        "descricao": "Uma unidade alvo não pode atacar no próximo turno.",
        "efeito": "onPlay:freeze(target_unit)"
    },
    {
        "id": "CORE_099",
        "nome": "Engolir pelas Profundezas",
        "tipo": "Ação",
        "nacao": "Leviathus",
        "tituloNacao": "A Fome de Leviathus",
        "custo": 6,
        "descricao": "Destrói uma unidade alvo.",
        "efeito": "onPlay:destroy(target_unit)"
    },
    {
        "id": "CORE_100",
        "nome": "Onda de Choque",
        "tipo": "Ação",
        "nacao": "Leviathus",
        "tituloNacao": "A Palma de Leviathus",
        "custo": 2,
        "descricao": "Devolve uma unidade alvo para a mão de seu dono.",
        "efeito": "onPlay:returnToHand(target_unit)"
    },
    {
        "id": "CORE_101",
        "nome": "Tsunami",
        "tipo": "Ação",
        "nacao": "Leviathus",
        "tituloNacao": "Canção de Leviathus",
        "custo": 5,
        "descricao": "Devolve todas as unidades inimigas para a mão de seus donos.",
        "efeito": "onPlay:returnToHand(all_enemy_units)"
    },
    {
        "id": "CORE_102",
        "nome": "Visão do Futuro",
        "tipo": "Ação",
        "nacao": "Leviathus",
        "tituloNacao": "A Profecia de Leviathus",
        "custo": 3,
        "descricao": "Compre 3 cartas.",
        "efeito": "onPlay:draw(3)"
    },
    {
        "id": "CORE_103",
        "nome": "Maré Alta",
        "tipo": "Suporte",
        "nacao": "Leviathus",
        "tituloNacao": "A Força de Leviathus",
        "custo": 5,
        "descricao": "No início do seu turno, devolva uma unidade aliada para sua mão.",
        "efeito": "onTurnStart:returnToHand(random_friendly_unit)"
    },
    {
        "id": "CORE_104",
        "nome": "Orbe da Clarividência",
        "tipo": "Suporte",
        "nacao": "Leviathus",
        "tituloNacao": "O Mistério de Leviathus",
        "custo": 3,
        "descricao": "Quando você joga uma carta de Ação, compre uma carta.",
        "efeito": "onOwnerPlayAction:draw(1)"
    },
    {
        "id": "CORE_105",
        "nome": "Tridente do Imperador",
        "tipo": "Suporte",
        "nacao": "Leviathus",
        "tituloNacao": "O Poder de Leviathus",
        "custo": 4,
        "descricao": "Suas unidades com Evasão ganham +1 de Ataque.",
        "efeito": "onPlay:buff(1,0,all_friendly_units_evasion)"
    },
    {
        "tipo": "General",
        "id": "EXP1_001",
        "nome": "Praetor Lumina",
        "nacao": "Aethel",
        "tituloNacao": "A Ordem Encarnada",
        "descricao": "A primeira unidade que seu oponente joga a cada turno custa 1 a mais.",
        "vida": 32,
        "arte": "images/EXP1/General/EXP1_001.webp",
        "segundaFace": {
            "nome": "Lumina, Vontade de Cristal",
            "ataque": 0,
            "vida": 35,
            "descricao": "As unidades do oponente entram em campo 'adormecidas' (não podem atacar ou usar habilidades por um turno).",
            "arte": "images/EXP1/General/EXP1_001_face2.webp"
        },
        "condicaoTransformacao": {
            "tipo": "CHEGAR_TURNO",
            "valor": 10,
            "custo": 5,
            "descricao": "Chegue ao seu 10º turno."
        }
    },
    {
        "id": "EXP1_002",
        "nome": "Acólito da Lei",
        "tipo": "Unidade",
        "nacao": "Aethel",
        "tituloNacao": "O Juramento de Aethel",
        "custo": 1,
        "descricao": "Último Suspiro: A próxima carta que seu oponente jogar custa 1 a mais.",
        "ataque": 1,
        "vida": 2,
        "arte": "images/EXP1/Unidade/EXP1_013.webp",
        "efeito": "onDeath:increaseCost(1, opponent_next_card)"
    },
    {
        "id": "EXP1_003",
        "nome": "Arauto da Ordem",
        "tipo": "Unidade",
        "nacao": "Aethel",
        "tituloNacao": "O Anúncio de Aethel",
        "custo": 3,
        "descricao": "Ao entrar em campo, uma unidade inimiga alvo fica 'adormecida'.",
        "ataque": 2,
        "vida": 3,
        "arte": "images/EXP1/Unidade/EXP1_009.webp",
        "efeito": "onPlay:freeze(target_enemy_unit)"
    },
    {
        "id": "EXP1_004",
        "nome": "Carcereiro Celestial",
        "tipo": "Unidade",
        "nacao": "Aethel",
        "tituloNacao": "A Prisão de Aethel",
        "custo": 5,
        "descricao": "Guarda-Costas. O oponente não pode alvejar suas outras unidades com Ações a menos que pague 2 de vida.",
        "ataque": 4,
        "vida": 6,
        "arte": "images/EXP1/Unidade/EXP1_010.webp",
        "keywords": [
            "Guarda-Costas"
        ]
    },
    {
        "id": "EXP1_005",
        "nome": "Executor da Sentença",
        "tipo": "Unidade",
        "nacao": "Aethel",
        "tituloNacao": "A Justiça de Aethel",
        "custo": 4,
        "descricao": "Sempre que um oponente paga um custo adicional por uma carta, esta unidade ganha +1/+1.",
        "ataque": 3,
        "vida": 4,
        "arte": "images/EXP1/Unidade/EXP1_008.webp",
        "efeito": "onOpponentPayExtraCost:buff(1,1,self)"
    },
    {
        "id": "EXP1_006",
        "nome": "Guardião do Dogma",
        "tipo": "Unidade",
        "nacao": "Aethel",
        "tituloNacao": "A Lei de Aethel",
        "custo": 2,
        "descricao": "Proteger(1). As cartas de Ação do seu oponente custam 1 a mais para serem jogadas.",
        "ataque": 1,
        "vida": 4,
        "arte": "images/EXP1/Unidade/EXP1_006.webp",
        "keywords": [
            "Proteger(1)"
        ]
    },
    {
        "id": "EXP1_007",
        "nome": "Inquisidor Radiante",
        "tipo": "Unidade",
        "nacao": "Aethel",
        "tituloNacao": "A Purga de Aethel",
        "custo": 4,
        "descricao": "Ao entrar em campo, remove todas as palavras-chave de uma unidade inimiga alvo.",
        "ataque": 3,
        "vida": 4,
        "arte": "images/EXP1/Unidade/EXP1_011.webp",
        "efeito": "onPlay:removeKeywords(target_enemy_unit)"
    },
    {
        "id": "EXP1_008",
        "nome": "Legislador Implacável",
        "tipo": "Unidade",
        "nacao": "Aethel",
        "tituloNacao": "A Ordem de Aethel",
        "custo": 3,
        "descricao": "Os Suportes do seu oponente custam 1 a mais para serem jogados.",
        "ataque": 3,
        "vida": 3,
        "arte": "images/EXP1/Unidade/EXP1_007.webp"
    },
    {
        "id": "EXP1_009",
        "nome": "Serafim da Punição",
        "tipo": "Unidade",
        "nacao": "Aethel",
        "tituloNacao": "O Veredito de Aethel",
        "custo": 7,
        "descricao": "Evasão. Quando esta unidade ataca, seu oponente não pode jogar cartas de Ação no próximo turno dele.",
        "ataque": 6,
        "vida": 6,
        "arte": "images/EXP1/Unidade/EXP1_012.webp",
        "keywords": [
            "Evasão"
        ],
        "efeito": "onAttack:lockActions(opponent)"
    },
    {
        "id": "EXP1_010",
        "nome": "Cadeias de Luz",
        "tipo": "Ação",
        "nacao": "Aethel",
        "tituloNacao": "A Restrição de Aethel",
        "custo": 4,
        "descricao": "Duas unidades inimigas alvo ficam 'adormecidas'.",
        "arte": "images/EXP1/Ação/EXP1_015.webp",
        "efeito": "onPlay:freeze(target_enemy_unit),freeze(target_enemy_unit)"
    },
    {
        "id": "EXP1_011",
        "nome": "Silêncio Solene",
        "tipo": "Ação",
        "nacao": "Aethel",
        "tituloNacao": "A Calma de Aethel",
        "custo": 2,
        "descricao": "As unidades inimigas não podem usar habilidades ativadas até o seu próximo turno.",
        "arte": "images/EXP1/Ação/EXP1_017.webp",
        "efeito": "onPlay:lockActivatedAbilities(opponent)"
    },
    {
        "id": "EXP1_012",
        "nome": "Tributo Divino",
        "tipo": "Ação",
        "nacao": "Aethel",
        "tituloNacao": "O Preço de Aethel",
        "custo": 3,
        "descricao": "Seu oponente sacrifica a unidade de maior ataque que ele controla.",
        "arte": "images/EXP1/Ação/EXP1_016.webp",
        "efeito": "onPlay:destroy(highest_attack_enemy_unit)"
    },
    {
        "id": "EXP1_013",
        "nome": "Veredito da Inércia",
        "tipo": "Ação",
        "nacao": "Aethel",
        "tituloNacao": "A Sentença de Aethel",
        "custo": 3,
        "descricao": "Destrói uma unidade alvo 'adormecida'.",
        "arte": "images/EXP1/Ação/EXP1_014.webp",
        "efeito": "onPlay:destroy(target_enemy_unit)"
    },
    {
        "id": "EXP1_014",
        "nome": "Câmara de Julgamento",
        "tipo": "Suporte",
        "nacao": "Aethel",
        "tituloNacao": "O Tribunal de Aethel",
        "custo": 4,
        "descricao": "Sempre que seu oponente joga uma carta que custa 5 ou mais, ele sofre 2 de dano.",
        "arte": "images/EXP1/Suporte/EXP1_019.webp",
        "efeito": "onOpponentPlayCard:damage(2, opponent_general)"
    },
    {
        "id": "EXP1_015",
        "nome": "Monumento à Lei",
        "tipo": "Suporte",
        "nacao": "Aethel",
        "tituloNacao": "O Pilar de Aethel",
        "custo": 2,
        "descricao": "No início do seu turno, olhe a mão do seu oponente e escolha uma carta. Ela custa 1 a mais para ser jogada.",
        "arte": "images/EXP1/Suporte/EXP1_020.webp",
        "efeito": "onTurnStart:increaseCost(1, chosen_card_in_hand)"
    },
    {
        "id": "EXP1_016",
        "nome": "Selo da Ordem",
        "tipo": "Suporte",
        "nacao": "Aethel",
        "tituloNacao": "O Decreto de Aethel",
        "custo": 3,
        "descricao": "No início do turno do seu oponente, a carta de maior custo na mão dele custa 1 a mais até o final do turno.",
        "arte": "images/EXP1/Suporte/EXP1_018.webp",
        "efeito": "onOpponentTurnStart:increaseCost(1, highest_cost_card_in_hand)"
    },
    {
        "tipo": "General",
        "id": "EXP1_017",
        "nome": "Mestre Artífice Kael",
        "nacao": "Kragmar",
        "tituloNacao": "O Grande Forjador",
        "descricao": "No final do seu turno, crie uma ficha de unidade Artefato 0/2 chamada 'Autômato Defensor' com Proteger(1).",
        "vida": 29,
        "arte": "images/EXP1/General/EXP1_017.webp",
        "efeito": "onTurnEnd:spawn(Autômato Defensor,0,2,empty_friendly_zone)",
        "segundaFace": {
            "nome": "Kael, A Grande Engrenagem",
            "ataque": 2,
            "vida": 32,
            "descricao": "Ativar (3): Conceda +2/+2 a todos os seus outros Artefatos permanentemente.",
            "arte": "images/EXP1/General/EXP1_017_face2.webp"
        },
        "condicaoTransformacao": {
            "tipo": "CONTROLAR_ARTEFATOS",
            "valor": 5,
            "custo": 4,
            "descricao": "Controle 5 ou mais Artefatos no início do seu turno."
        }
    },
    {
        "id": "EXP1_018",
        "nome": "Autômato de Carga",
        "tipo": "Unidade",
        "nacao": "Kragmar",
        "tituloNacao": "O Ariete de Kragmar",
        "custo": 3,
        "descricao": "Ímpeto.",
        "ataque": 3,
        "vida": 2,
        "arte": "images/EXP1/Unidade/EXP1_025.webp",
        "keywords": [
            "Ímpeto"
        ]
    },
    {
        "id": "EXP1_019",
        "nome": "Colosso de Engrenagens",
        "tipo": "Unidade",
        "nacao": "Kragmar",
        "tituloNacao": "A Fúria de Kragmar",
        "custo": 8,
        "descricao": "O custo para jogar esta carta é reduzido em 1 para cada Máquina que você controla.",
        "ataque": 7,
        "vida": 7,
        "arte": "images/EXP1/Unidade/EXP1_029.webp"
    },
    {
        "id": "EXP1_020",
        "nome": "Engenho de Demolição",
        "tipo": "Unidade",
        "nacao": "Kragmar",
        "tituloNacao": "A Bomba de Kragmar",
        "custo": 4,
        "descricao": "Ativar(0): Sacrifique esta unidade para destruir uma unidade inimiga alvo.",
        "ataque": 2,
        "vida": 2,
        "arte": "images/EXP1/Unidade/EXP1_024.webp",
        "efeito": "onActivate(0):destroy(target_enemy_unit),destroy(self)"
    },
    {
        "id": "EXP1_021",
        "nome": "Forjador de Autômatos",
        "tipo": "Unidade",
        "nacao": "Kragmar",
        "tituloNacao": "O Legado de Kragmar",
        "custo": 3,
        "descricao": "Último Suspiro: Crie uma ficha de Máquina 1/1 'Pequeno Autômato'.",
        "ataque": 2,
        "vida": 2,
        "arte": "images/EXP1/Unidade/EXP1_022.webp",
        "efeito": "onDeath:spawn(Pequeno Autômato,1,1,empty_friendly_zone)"
    },
    {
        "id": "EXP1_022",
        "nome": "Mecano-Aranha",
        "tipo": "Unidade",
        "nacao": "Kragmar",
        "tituloNacao": "A Centelha de Kragmar",
        "custo": 2,
        "descricao": "Ao entrar em campo, se você controlar outra Máquina, compre uma carta.",
        "ataque": 1,
        "vida": 2,
        "arte": "images/EXP1/Unidade/EXP1_021.webp",
        "efeito": "onPlay:draw(1)"
    },
    {
        "id": "EXP1_023",
        "nome": "Replicador Arcano",
        "tipo": "Unidade",
        "nacao": "Kragmar",
        "tituloNacao": "A Cópia de Kragmar",
        "custo": 6,
        "descricao": "Ao entrar em campo, crie uma cópia de outra Máquina que você controla.",
        "ataque": 4,
        "vida": 4,
        "arte": "images/EXP1/Unidade/EXP1_026.webp",
        "efeito": "onPlay:spawn(copy,X,Y,empty_friendly_zone)"
    },
    {
        "id": "EXP1_024",
        "nome": "Sentinela de Bronze",
        "tipo": "Unidade",
        "nacao": "Kragmar",
        "tituloNacao": "A Muralha de Kragmar",
        "custo": 1,
        "descricao": "Proteger(1).",
        "ataque": 0,
        "vida": 3,
        "arte": "images/EXP1/Unidade/EXP1_023.webp",
        "keywords": [
            "Proteger(1)"
        ]
    },
    {
        "id": "EXP1_025",
        "nome": "Sucateiro Goblin",
        "tipo": "Unidade",
        "nacao": "Kragmar",
        "tituloNacao": "O Inventor de Kragmar",
        "custo": 2,
        "descricao": "Sempre que uma Máquina aliada morre, esta unidade ganha +2/+1.",
        "ataque": 1,
        "vida": 2,
        "arte": "images/EXP1/Unidade/EXP1_027.webp",
        "efeito": "onFriendlyUnitDeath:buff(2,1,self)"
    },
    {
        "id": "EXP1_026",
        "nome": "Supervisor da Forja",
        "tipo": "Unidade",
        "nacao": "Kragmar",
        "tituloNacao": "O Mestre de Kragmar",
        "custo": 3,
        "descricao": "Suas outras Máquinas têm +1 de Ataque.",
        "ataque": 2,
        "vida": 3,
        "arte": "images/EXP1/Unidade/EXP1_028.webp"
    },
    {
        "id": "EXP1_027",
        "nome": "Protocolo de Montagem",
        "tipo": "Ação",
        "nacao": "Kragmar",
        "tituloNacao": "A Criação de Kragmar",
        "custo": 3,
        "descricao": "Crie duas fichas de Máquina 1/1 'Pequeno Autômato'.",
        "arte": "images/EXP1/Ação/EXP1_030.webp",
        "efeito": "onPlay:spawn(Pequeno Autômato,1,1,empty_friendly_zone),spawn(Pequeno Autômato,1,1,empty_friendly_zone)"
    },
    {
        "id": "EXP1_028",
        "nome": "Reconfiguração em Massa",
        "tipo": "Ação",
        "nacao": "Kragmar",
        "tituloNacao": "A Inovação de Kragmar",
        "custo": 5,
        "descricao": "Escolha um: Conceda +1/+1 a todas as suas Máquinas; ou cause 2 de dano a todas as unidades que não são Máquinas.",
        "arte": "images/EXP1/Ação/EXP1_032.webp"
    },
    {
        "id": "EXP1_029",
        "nome": "Sobrecarga de Energia",
        "tipo": "Ação",
        "nacao": "Kragmar",
        "tituloNacao": "O Poder de Kragmar",
        "custo": 2,
        "descricao": "Concede +3/+3 e Atropelar a uma Máquina alvo até o final do turno.",
        "arte": "images/EXP1/Ação/EXP1_031.webp",
        "efeito": "onPlay:tempBuff(3,3,target_friendly_unit),addKeyword(Atropelar,target_friendly_unit)"
    },
    {
        "id": "EXP1_030",
        "nome": "Blueprint Lendário",
        "tipo": "Suporte",
        "nacao": "Kragmar",
        "tituloNacao": "O Plano de Kragmar",
        "custo": 3,
        "descricao": "A primeira Máquina que você joga a cada turno custa 1 a menos.",
        "arte": "images/EXP1/Suporte/EXP1_035.webp"
    },
    {
        "id": "EXP1_031",
        "nome": "Linha de Montagem",
        "tipo": "Suporte",
        "nacao": "Kragmar",
        "tituloNacao": "A Fábrica de Kragmar",
        "custo": 3,
        "descricao": "No início do seu turno, crie uma ficha de Máquina 1/1 'Pequeno Autômato'.",
        "arte": "images/EXP1/Suporte/EXP1_033.webp",
        "efeito": "onTurnStart:spawn(Pequeno Autômato,1,1,empty_friendly_zone)"
    },
    {
        "id": "EXP1_032",
        "nome": "Núcleo de Poder Instável",
        "tipo": "Suporte",
        "nacao": "Kragmar",
        "tituloNacao": "O Reator de Kragmar",
        "custo": 2,
        "descricao": "Ativar(0): Sacrifique este suporte para conceder +2 de Ataque a todas as suas Máquinas até o final do turno.",
        "arte": "images/EXP1/Suporte/EXP1_034.webp",
        "efeito": "onActivate(0):tempBuff(2,0,all_friendly_units),destroy(self)"
    },
    {
        "tipo": "General",
        "id": "EXP1_033",
        "nome": "Roric Coração-de-Pedra",
        "nacao": "Sylvanis",
        "tituloNacao": "O Coração Selvagem",
        "descricao": "Guarda-Costas. Sempre que você jogar uma Ação em Roric, ele ganha +1/+1 permanentemente.",
        "vida": 26,
        "arte": "images/EXP1/General/EXP1_033.webp",
        "efeito": "onPlayActionOnSelf:buff(1,1,self)",
        "segundaFace": {
            "nome": "Roric, Fúria Primordial",
            "ataque": 3,
            "vida": 30,
            "descricao": "Ganha Atropelar. Quando esta unidade ataca, conceda +4/+0 a ela até o final do turno.",
            "arte": "images/EXP1/General/EXP1_033_face2.webp"
        },
        "condicaoTransformacao": {
            "tipo": "ATINGIR_ATAQUE",
            "valor": 10,
            "custo": 4,
            "descricao": "Atinja 10 ou mais de Ataque com Roric."
        }
    },
    {
        "id": "EXP1_034",
        "nome": "Elemental do Gelo Protetor",
        "tipo": "Unidade",
        "nacao": "Sylvanis",
        "tituloNacao": "A Geada de Sylvanis",
        "custo": 4,
        "descricao": "Guarda-Costas. Não pode ser alvo de Ações inimigas.",
        "ataque": 3,
        "vida": 5,
        "arte": "images/EXP1/Unidade/EXP1_040.webp",
        "keywords": [
            "Guarda-Costas"
        ]
    },
    {
        "id": "EXP1_035",
        "nome": "Eremita Sábio",
        "tipo": "Unidade",
        "nacao": "Sylvanis",
        "tituloNacao": "A Visão de Sylvanis",
        "custo": 2,
        "descricao": "Ao entrar em campo, olhe as 3 primeiras cartas do seu baralho. Você pode revelar uma carta de Ação e colocá-la na sua mão.",
        "ataque": 1,
        "vida": 1,
        "arte": "images/EXP1/Unidade/EXP1_037.webp",
        "efeito": "onPlay:tutor(Action,3)"
    },
    {
        "id": "EXP1_036",
        "nome": "Espírito da Fera Ancestral",
        "tipo": "Unidade",
        "nacao": "Sylvanis",
        "tituloNacao": "O Legado de Sylvanis",
        "custo": 5,
        "descricao": "Último Suspiro: Conceda os status desta unidade a uma unidade aliada aleatória.",
        "ataque": 4,
        "vida": 4,
        "arte": "images/EXP1/Unidade/EXP1_041.webp",
        "efeito": "onDeath:buff(4,4,random_friendly_unit)"
    },
    {
        "id": "EXP1_037",
        "nome": "Guardião do Pico",
        "tipo": "Unidade",
        "nacao": "Sylvanis",
        "tituloNacao": "A Muralha de Sylvanis",
        "custo": 2,
        "descricao": "Guarda-Costas (Esta unidade deve ser atacada antes de outras unidades sem esta habilidade).",
        "ataque": 1,
        "vida": 5,
        "arte": "images/EXP1/Unidade/EXP1_036.webp",
        "keywords": [
            "Guarda-Costas"
        ]
    },
    {
        "id": "EXP1_038",
        "nome": "Lobo Solitário",
        "tipo": "Unidade",
        "nacao": "Sylvanis",
        "tituloNacao": "O Predador de Sylvanis",
        "custo": 1,
        "descricao": "Não pode atacar se você controlar outra unidade.",
        "ataque": 3,
        "vida": 1,
        "arte": "images/EXP1/Unidade/EXP1_038.webp"
    },
    {
        "id": "EXP1_039",
        "nome": "Xamã da Montanha",
        "tipo": "Unidade",
        "nacao": "Sylvanis",
        "tituloNacao": "O Ritualista de Sylvanis",
        "custo": 3,
        "descricao": "Sempre que você joga uma Ação em outra unidade aliada, esta unidade ganha +1/+1.",
        "ataque": 2,
        "vida": 3,
        "arte": "images/EXP1/Unidade/EXP1_039.webp",
        "efeito": "onOwnerPlayAction:buff(1,1,self)"
    },
    {
        "id": "EXP1_040",
        "nome": "Bênção Ancestral",
        "tipo": "Ação",
        "nacao": "Sylvanis",
        "tituloNacao": "A Vida de Sylvanis",
        "custo": 1,
        "descricao": "Concede +1/+1 e Vínculo Vital a uma unidade aliada alvo.",
        "arte": "images/EXP1/Ação/EXP1_046.webp",
        "efeito": "onPlay:buff(1,1,target_friendly_unit),addKeyword(Vínculo Vital,target_friendly_unit)"
    },
    {
        "id": "EXP1_041",
        "nome": "Crescimento Titânico",
        "tipo": "Ação",
        "nacao": "Sylvanis",
        "tituloNacao": "O Ápice de Sylvanis",
        "custo": 7,
        "descricao": "Dobre o Ataque e a Vida de uma unidade aliada alvo.",
        "arte": "images/EXP1/Ação/EXP1_047.webp",
        "efeito": "onPlay:doubleStats(target_friendly_unit)"
    },
    {
        "id": "EXP1_042",
        "nome": "Espírito do Lobo",
        "tipo": "Ação",
        "nacao": "Sylvanis",
        "tituloNacao": "A Caça de Sylvanis",
        "custo": 3,
        "descricao": "Concede +2/+2 e Ímpeto a uma unidade aliada alvo.",
        "arte": "images/EXP1/Ação/EXP1_043.webp",
        "efeito": "onPlay:buff(2,2,target_friendly_unit),addKeyword(Ímpeto,target_friendly_unit)"
    },
    {
        "id": "EXP1_043",
        "nome": "Fúria da Montanha",
        "tipo": "Ação",
        "nacao": "Sylvanis",
        "tituloNacao": "O Espírito de Sylvanis",
        "custo": 4,
        "descricao": "Concede +3/+3 e Proteger(1) a uma unidade aliada alvo.",
        "arte": "images/EXP1/Ação/EXP1_042.webp",
        "efeito": "onPlay:buff(3,3,target_friendly_unit),addKeyword(Proteger(1),target_friendly_unit)"
    },
    {
        "id": "EXP1_044",
        "nome": "Instinto Predatório",
        "tipo": "Ação",
        "nacao": "Sylvanis",
        "tituloNacao": "A Fome de Sylvanis",
        "custo": 2,
        "descricao": "Concede +2/+0 e Atropelar a uma unidade aliada alvo.",
        "arte": "images/EXP1/Ação/EXP1_045.webp",
        "efeito": "onPlay:buff(2,0,target_friendly_unit),addKeyword(Atropelar,target_friendly_unit)"
    },
    {
        "id": "EXP1_045",
        "nome": "Pele de Pedra",
        "tipo": "Ação",
        "nacao": "Sylvanis",
        "tituloNacao": "A Defesa de Sylvanis",
        "custo": 2,
        "descricao": "Concede +0/+4 e Guarda-Costas a uma unidade aliada alvo.",
        "arte": "images/EXP1/Ação/EXP1_044.webp",
        "efeito": "onPlay:buff(0,4,target_friendly_unit),addKeyword(Guarda-Costas,target_friendly_unit)"
    },
    {
        "id": "EXP1_046",
        "nome": "Altar da Fera Única",
        "tipo": "Suporte",
        "nacao": "Sylvanis",
        "tituloNacao": "O Santuário de Sylvanis",
        "custo": 3,
        "descricao": "No final do seu turno, se você controlar exatamente uma unidade, cure-a completamente.",
        "arte": "images/EXP1/Suporte/EXP1_049.webp",
        "efeito": "onTurnEnd:heal(99,self)"
    },
    {
        "id": "EXP1_047",
        "nome": "Totem do Caçador Solitário",
        "tipo": "Suporte",
        "nacao": "Sylvanis",
        "tituloNacao": "O Foco de Sylvanis",
        "custo": 2,
        "descricao": "No início do seu turno, se você controlar exatamente uma unidade, conceda +1/+1 a ela.",
        "arte": "images/EXP1/Suporte/EXP1_048.webp",
        "efeito": "onTurnStart:buff(1,1,self)"
    },
    {
        "id": "EXP1_048",
        "nome": "Trilha do Eremita",
        "tipo": "Suporte",
        "nacao": "Sylvanis",
        "tituloNacao": "O Caminho de Sylvanis",
        "custo": 2,
        "descricao": "A primeira Ação que você joga a cada turno custa 1 a menos.",
        "arte": "images/EXP1/Suporte/EXP1_050.webp"
    },
    {
        "tipo": "General",
        "id": "EXP1_049",
        "nome": "Zara",
        "nacao": "Noxaeterna",
        "tituloNacao": "Tecelã do Torpor",
        "descricao": "No início do seu turno, uma unidade inimiga aleatória fica 'adormecida' (não pode atacar no próximo turno).",
        "vida": 28,
        "arte": "images/EXP1/General/EXP1_049.webp",
        "efeito": "onTurnStart:freeze(random_enemy_unit)",
        "segundaFace": {
            "nome": "Nox, Encarnação da Noite",
            "ataque": 1,
            "vida": 32,
            "descricao": "As unidades do oponente entram em campo 'adormecidas'.",
            "arte": "images/EXP1/General/EXP1_049_face2.webp"
        },
        "condicaoTransformacao": {
            "tipo": "INIMIGOS_ADORMECIDOS",
            "valor": 8,
            "custo": 4,
            "descricao": "Se 8 ou mais unidades inimigas foram adormecidas neste jogo."
        }
    },
    {
        "id": "EXP1_050",
        "nome": "Dançarina do Véu",
        "tipo": "Unidade",
        "nacao": "Noxaeterna",
        "tituloNacao": "A Dança de Noxaeterna",
        "custo": 4,
        "descricao": "Quando esta unidade ataca, a unidade defensora fica 'adormecida' após o combate.",
        "ataque": 3,
        "vida": 4,
        "arte": "images/EXP1/Unidade/EXP1_055.webp",
        "efeito": "onAttack:freeze(defending_unit)"
    },
    {
        "id": "EXP1_051",
        "nome": "Espectro do Torpor",
        "tipo": "Unidade",
        "nacao": "Noxaeterna",
        "tituloNacao": "O Sono de Noxaeterna",
        "custo": 4,
        "descricao": "No final do seu turno, uma unidade inimiga aleatória fica 'adormecida'.",
        "ataque": 1,
        "vida": 4,
        "arte": "images/EXP1/Unidade/EXP1_052.webp",
        "efeito": "onTurnEnd:freeze(random_enemy_unit)"
    },
    {
        "id": "EXP1_052",
        "nome": "Guardião do Silêncio",
        "tipo": "Unidade",
        "nacao": "Noxaeterna",
        "tituloNacao": "O Vazio de Noxaeterna",
        "custo": 3,
        "descricao": "Seu oponente não pode alvejar unidades 'adormecidas'.",
        "ataque": 2,
        "vida": 4,
        "arte": "images/EXP1/Unidade/EXP1_056.webp"
    },
    {
        "id": "EXP1_053",
        "nome": "Horror Devorador de Sonhos",
        "tipo": "Unidade",
        "nacao": "Noxaeterna",
        "tituloNacao": "O Fim de Noxaeterna",
        "custo": 7,
        "descricao": "Ao entrar em campo, destrua todas as unidades 'adormecidas'.",
        "ataque": 6,
        "vida": 6,
        "arte": "images/EXP1/Unidade/EXP1_058.webp",
        "efeito": "onPlay:destroy(all_sleeping_units)"
    },
    {
        "id": "EXP1_054",
        "nome": "Predador Onírico",
        "tipo": "Unidade",
        "nacao": "Noxaeterna",
        "tituloNacao": "O Caçador de Noxaeterna",
        "custo": 3,
        "descricao": "Não pode ser bloqueado por unidades 'adormecidas'.",
        "ataque": 4,
        "vida": 2,
        "arte": "images/EXP1/Unidade/EXP1_053.webp"
    },
    {
        "id": "EXP1_055",
        "nome": "Sussurro Hipnótico",
        "tipo": "Unidade",
        "nacao": "Noxaeterna",
        "tituloNacao": "O Torpor de Noxaeterna",
        "custo": 3,
        "descricao": "Evasão. Ao entrar em campo, uma unidade inimiga alvo fica 'adormecida'.",
        "ataque": 2,
        "vida": 2,
        "arte": "images/EXP1/Unidade/EXP1_051.webp",
        "keywords": [
            "Evasão"
        ],
        "efeito": "onPlay:freeze(target_enemy_unit)"
    },
    {
        "id": "EXP1_056",
        "nome": "Súcubo Insone",
        "tipo": "Unidade",
        "nacao": "Noxaeterna",
        "tituloNacao": "O Beijo de Noxaeterna",
        "custo": 5,
        "descricao": "Evasão. Quando esta unidade causa dano de combate ao General inimigo, uma unidade inimiga aleatória fica 'adormecida'.",
        "ataque": 4,
        "vida": 4,
        "arte": "images/EXP1/Unidade/EXP1_057.webp",
        "keywords": [
            "Evasão"
        ],
        "efeito": "onEnemyGeneralDamage:freeze(random_enemy_unit)"
    },
    {
        "id": "EXP1_057",
        "nome": "Vulto da Meia-Noite",
        "tipo": "Unidade",
        "nacao": "Noxaeterna",
        "tituloNacao": "A Sombra de Noxaeterna",
        "custo": 2,
        "descricao": "Evasão. Sempre que uma unidade inimiga é 'adormecida', esta unidade ganha +1/+0.",
        "ataque": 1,
        "vida": 2,
        "arte": "images/EXP1/Unidade/EXP1_054.webp",
        "keywords": [
            "Evasão"
        ],
        "efeito": "onEnemyUnitFreeze:buff(1,0,self)"
    },
    {
        "id": "EXP1_058",
        "nome": "Pesadelo Final",
        "tipo": "Ação",
        "nacao": "Noxaeterna",
        "tituloNacao": "O Despertar de Noxaeterna",
        "custo": 2,
        "descricao": "Destrói uma unidade inimiga 'adormecida'.",
        "arte": "images/EXP1/Ação/EXP1_059.webp",
        "efeito": "onPlay:destroy(target_enemy_unit)"
    },
    {
        "id": "EXP1_059",
        "nome": "Sono Profundo",
        "tipo": "Ação",
        "nacao": "Noxaeterna",
        "tituloNacao": "O Encanto de Noxaeterna",
        "custo": 2,
        "descricao": "Uma unidade inimiga alvo fica 'adormecida'. Compre uma carta.",
        "arte": "images/EXP1/Ação/EXP1_060.webp",
        "efeito": "onPlay:freeze(target_enemy_unit),draw(1)"
    },
    {
        "id": "EXP1_060",
        "nome": "Sussurros Traiçoeiros",
        "tipo": "Ação",
        "nacao": "Noxaeterna",
        "tituloNacao": "A Traição de Noxaeterna",
        "custo": 4,
        "descricao": "Tome o controle de uma unidade inimiga 'adormecida' até o final do turno. Ela ganha Ímpeto.",
        "arte": "images/EXP1/Ação/EXP1_062.webp",
        "efeito": "onPlay:mindControl(target_enemy_unit)"
    },
    {
        "id": "EXP1_061",
        "nome": "Torpor em Massa",
        "tipo": "Ação",
        "nacao": "Noxaeterna",
        "tituloNacao": "A Noite de Noxaeterna",
        "custo": 6,
        "descricao": "Todas as unidades inimigas ficam 'adormecidas'.",
        "arte": "images/EXP1/Ação/EXP1_061.webp",
        "efeito": "onPlay:freeze(all_enemy_units)"
    },
    {
        "id": "EXP1_062",
        "nome": "Ampulheta dos Sonhos Quebrados",
        "tipo": "Suporte",
        "nacao": "Noxaeterna",
        "tituloNacao": "O Tempo de Noxaeterna",
        "custo": 2,
        "descricao": "Sempre que uma unidade inimiga 'acorda', cause 1 de dano ao General inimigo.",
        "arte": "images/EXP1/Suporte/EXP1_065.webp",
        "efeito": "onEnemyUnitUnfreeze:damage(1,opponent_general)"
    },
    {
        "id": "EXP1_063",
        "nome": "Monolito do Sono de Gelo",
        "tipo": "Suporte",
        "nacao": "Noxaeterna",
        "tituloNacao": "O Obelisco de Noxaeterna",
        "custo": 4,
        "descricao": "No início do seu turno, se não houver unidades inimigas 'adormecidas', uma aleatória fica 'adormecida'.",
        "arte": "images/EXP1/Suporte/EXP1_064.webp",
        "efeito": "onTurnStart:freeze(random_enemy_unit)"
    },
    {
        "id": "EXP1_064",
        "nome": "Véu da Noite Eterna",
        "tipo": "Suporte",
        "nacao": "Noxaeterna",
        "tituloNacao": "O Segredo de Noxaeterna",
        "custo": 3,
        "descricao": "Sempre que uma unidade inimiga é 'adormecida', seu oponente descarta uma carta.",
        "arte": "images/EXP1/Suporte/EXP1_063.webp",
        "efeito": "onEnemyUnitFreeze:discard(1, opponent)"
    },
    {
        "tipo": "General",
        "id": "EXP1_065",
        "nome": "Somnia",
        "nacao": "Leviathus",
        "tituloNacao": "Oráculo do Naufrágio",
        "descricao": "Sempre que você joga uma carta de Ação, coloque as 2 primeiras cartas do seu baralho no seu cemitério.",
        "vida": 30,
        "arte": "images/EXP1/General/EXP1_065.webp",
        "efeito": "onOwnerPlayAction:mill(2, self_player)",
        "segundaFace": {
            "nome": "Somnia, Lamento do Leviatã",
            "descricao": "O Ataque e a Vida desta unidade são iguais ao número de cartas no seu cemitério.",
            "arte": "images/EXP1/General/EXP1_065_face2.webp"
        },
        "condicaoTransformacao": {
            "tipo": "CARTAS_NO_PROPRIO_CEMITERIO",
            "valor": 20,
            "custo": 4,
            "descricao": "Se você tiver 20 ou mais cartas no seu cemitério."
        }
    },
    {
        "id": "EXP1_066",
        "nome": "Dragão Marinho Espectral",
        "tipo": "Unidade",
        "nacao": "Leviathus",
        "tituloNacao": "A Assombração de Leviathus",
        "custo": 5,
        "descricao": "Evasão. O Ataque desta unidade é igual ao número de Unidades no seu cemitério.",
        "ataque": "X",
        "vida": 4,
        "arte": "images/EXP1/Unidade/EXP1_072.webp",
        "keywords": [
            "Evasão"
        ]
    },
    {
        "id": "EXP1_067",
        "nome": "Espírito do Navio Afundado",
        "tipo": "Unidade",
        "nacao": "Leviathus",
        "tituloNacao": "O Eco de Leviathus",
        "custo": 3,
        "descricao": "Quando esta carta é colocada no seu cemitério vinda do seu baralho, crie uma ficha de Fantasma 1/1 com Evasão.",
        "ataque": 2,
        "vida": 2,
        "arte": "images/EXP1/Unidade/EXP1_066.webp",
        "efeito": "onMill:spawn(Fantasma,1,1,empty_friendly_zone)"
    },
    {
        "id": "EXP1_068",
        "nome": "Guardião do Conhecimento Perdido",
        "tipo": "Unidade",
        "nacao": "Leviathus",
        "tituloNacao": "A Biblioteca de Leviathus",
        "custo": 3,
        "descricao": "Ganha +1/+1 para cada carta de Ação no seu cemitério.",
        "ataque": 1,
        "vida": 2,
        "arte": "images/EXP1/Unidade/EXP1_069.webp"
    },
    {
        "id": "EXP1_069",
        "nome": "Kraken Ressurgido",
        "tipo": "Unidade",
        "nacao": "Leviathus",
        "tituloNacao": "O Retorno de Leviathus",
        "custo": 7,
        "descricao": "Você pode jogar esta carta do seu cemitério. Se o fizer, ela é banida.",
        "ataque": 6,
        "vida": 6,
        "arte": "images/EXP1/Unidade/EXP1_068.webp"
    },
    {
        "id": "EXP1_070",
        "nome": "Leviatã das Profundezas Esquecidas",
        "tipo": "Unidade",
        "nacao": "Leviathus",
        "tituloNacao": "O Pesadelo de Leviathus",
        "custo": 10,
        "descricao": "Custa 1 a menos para ser jogado para cada 5 cartas no seu cemitério.",
        "ataque": 8,
        "vida": 8,
        "arte": "images/EXP1/Unidade/EXP1_071.webp"
    },
    {
        "id": "EXP1_071",
        "nome": "Profeta do Abismo",
        "tipo": "Unidade",
        "nacao": "Leviathus",
        "tituloNacao": "A Voz de Leviathus",
        "custo": 2,
        "descricao": "Ao entrar em campo, coloque as 3 primeiras cartas do seu baralho no seu cemitério.",
        "ataque": 2,
        "vida": 1,
        "arte": "images/EXP1/Unidade/EXP1_067.webp",
        "efeito": "onPlay:mill(3,self_player)"
    },
    {
        "id": "EXP1_072",
        "nome": "Sirene do Lamento",
        "tipo": "Unidade",
        "nacao": "Leviathus",
        "tituloNacao": "O Chamado de Leviathus",
        "custo": 4,
        "descricao": "Quando esta unidade é colocada no seu cemitério vinda do seu baralho, devolva uma carta de Ação do seu cemitério para a sua mão.",
        "ataque": 3,
        "vida": 3,
        "arte": "images/EXP1/Unidade/EXP1_070.webp",
        "efeito": "onMill:recover(Action,self_graveyard)"
    },
    {
        "id": "EXP1_073",
        "nome": "Chamado do Abismo",
        "tipo": "Ação",
        "nacao": "Leviathus",
        "tituloNacao": "A Profundeza de Leviathus",
        "custo": 3,
        "descricao": "Devolva uma unidade do seu cemitério para a sua mão. Ela custa 2 a menos.",
        "arte": "images/EXP1/Ação/EXP1_076.webp",
        "efeito": "onPlay:recover(Unit,self_graveyard)"
    },
    {
        "id": "EXP1_074",
        "nome": "Correntes do Esquecimento",
        "tipo": "Ação",
        "nacao": "Leviathus",
        "tituloNacao": "A Corrente de Leviathus",
        "custo": 3,
        "descricao": "Devolva uma unidade inimiga alvo para a mão de seu dono. Coloque as 2 primeiras cartas do seu baralho no seu cemitério.",
        "arte": "images/EXP1/Ação/EXP1_075.webp",
        "efeito": "onPlay:returnToHand(target_enemy_unit),mill(2,self_player)"
    },
    {
        "id": "EXP1_075",
        "nome": "Dragagem Abissal",
        "tipo": "Ação",
        "nacao": "Leviathus",
        "tituloNacao": "O Segredo de Leviathus",
        "custo": 2,
        "descricao": "Coloque as 5 primeiras cartas do seu baralho no seu cemitério. Depois, você pode escolher uma carta de Ação do seu cemitério e colocá-la na sua mão.",
        "arte": "images/EXP1/Ação/EXP1_073.webp",
        "efeito": "onPlay:mill(5,self_player),recover(Action,self_graveyard)"
    },
    {
        "id": "EXP1_076",
        "nome": "Visões das Profundezas",
        "tipo": "Ação",
        "nacao": "Leviathus",
        "tituloNacao": "O Oráculo de Leviathus",
        "custo": 1,
        "descricao": "Coloque as 4 primeiras cartas do seu baralho no seu cemitério. Compre uma carta.",
        "arte": "images/EXP1/Ação/EXP1_074.webp",
        "efeito": "onPlay:mill(4,self_player),draw(1)"
    },
    {
        "id": "EXP1_077",
        "nome": "Vórtice do Conhecimento",
        "tipo": "Ação",
        "nacao": "Leviathus",
        "tituloNacao": "O Redemoinho de Leviathus",
        "custo": 4,
        "descricao": "Compre 3 cartas, depois coloque as 3 primeiras cartas do seu baralho no seu cemitério.",
        "arte": "images/EXP1/Ação/EXP1_077.webp",
        "efeito": "onPlay:draw(3),mill(3,self_player)"
    },
    {
        "id": "EXP1_078",
        "nome": "Biblioteca Submersa",
        "tipo": "Suporte",
        "nacao": "Leviathus",
        "tituloNacao": "O Arquivo de Leviathus",
        "custo": 2,
        "descricao": "Sempre que uma ou mais cartas são colocadas no seu cemitério vindas do seu baralho, cure 1 de vida do seu General.",
        "arte": "images/EXP1/Suporte/EXP1_079.webp",
        "efeito": "onMill:heal(1,owner_general)"
    },
    {
        "id": "EXP1_079",
        "nome": "Correnteza Temporal",
        "tipo": "Suporte",
        "nacao": "Leviathus",
        "tituloNacao": "O Fluxo de Leviathus",
        "custo": 1,
        "descricao": "No início do seu turno, coloque a primeira carta do seu baralho no seu cemitério.",
        "arte": "images/EXP1/Suporte/EXP1_080.webp",
        "efeito": "onTurnStart:mill(1,self_player)"
    },
    {
        "id": "EXP1_080",
        "nome": "Recife dos Ecos",
        "tipo": "Suporte",
        "nacao": "Leviathus",
        "tituloNacao": "A Memória de Leviathus",
        "custo": 4,
        "descricao": "Uma vez por turno, você pode jogar uma carta de Ação do seu cemitério. Se o fizer, ela é banida após o uso.",
        "arte": "images/EXP1/Suporte/EXP1_078.webp"
    }
];
