export const getPronounGroupById = function (id) {
    switch (id) {
        case 0:
            return Pronouns.HeHimHis
        case 1:
            return Pronouns.SheHerHers
        case 2:
            return Pronouns.TheyThemTheirs
        case 3:
            return Pronouns.ItIts
        case 4:
            return Pronouns.AnyAnyAny
        case 5:
            return Pronouns.ZeZirZirs
        case 6:
            return Pronouns.ZeHirHirs
        case 7:
            return Pronouns.XeXemXyrs
        case 8:
            return Pronouns.EyEmEirs
        case 9:
            return Pronouns.FaeFaerFaers
        case 10:
            return Pronouns.EEmEms
        case 11:
            return Pronouns.VeVerVis
        case 12:
            return Pronouns.NeNemNir
        case 13:
            return Pronouns.PerPerPers
        default:
            return undefined
    }
}

export const getCaseById = function (caseid) {
    switch (caseid) {
        case 0:
            return Cases.NominativeCase
        case 1:
            return Cases.AccusativeCase
        case 2:
            return Cases.ReflexivePronoun
        case 3:
            return Cases.IndependentGenitiveCase
        case 4:
            return Cases.DependentGenitiveCase
        default:
            return -1
    }
}

export const Pronouns = {
    HeHimHis: {
        Id: 0,
        NominativeCase: "He",
        AccusativeCase: "Him",
        ReflexivePronoun: "Himself",
        IndependentGenitiveCase: "His",
        DependentGenitiveCase: "His"
    },
    SheHerHers: {
        Id: 1,
        NominativeCase: "She",
        AccusativeCase: "Her",
        ReflexivePronoun: "Herself",
        IndependentGenitiveCase: "Hers",
        DependentGenitiveCase: "Her"
    },
    TheyThemTheirs: {
        Id: 2,
        NominativeCase: "They",
        AccusativeCase: "Them",
        ReflexivePronoun: "Themselves"
    },
    ItIts: {
        Id: 3,
        NominativeCase: "It",
        AccusativeCase: "It",
        ReflexivePronoun: "Itself",
        DependentGenitiveCase: "Its"
    },
    AnyAnyAny: {
        Id: 4,
        NominativeCase: "Any",
        AccusativeCase: "Any"
    },
    // Sorry if some of these neopronouns are wrong, please fix if they are
    ZeZirZirs: {
        Id: 5,
        NominativeCase: "Ze",
        AccusativeCase: "Zir",
        ReflexivePronoun: "Zirself",
        IndependentGenitiveCase: "Zirs"
    },
    ZeHirHirs: {
        Id: 6,
        NominativeCase: "Ze",
        AccusativeCase: "Hir",
        ReflexivePronoun: "Hirself",
        IndependentGenitiveCase: "Hirs"
    },
    XeXemXyrs: {
        Id: 7,
        NominativeCase: "Xe",
        AccusativeCase: "Xem",
        ReflexivePronoun: "Xyrself",
        IndependentGenitiveCase: "Xyrs"
    },
    EyEmEirs: {
        Id: 8,
        NominativeCase: "Ey",
        AccusativeCase: "Em",
        ReflexivePronoun: "Eirself",
        IndependentGenitiveCase: "Eirs"
    },
    FaeFaerFaers: {
        Id: 9,
        NominativeCase: "Fae",
        AccusativeCase: "Faer",
        ReflexivePronoun: "Faerself",
        IndependentGenitiveCase: "Faers"
    },
    EEmEms: {
        Id: 10,
        NominativeCase: "Em",
        AccusativeCase: "Eir",
        ReflexivePronoun: "Eirself",
        IndependentGenitiveCase: "Eirs"
    },
    VeVerVis: {
        Id: 11,
        NominativeCase: "Ve",
        AccusativeCase: "Ver",
        ReflexivePronoun: "Verself",
        IndependentGenitiveCase: "Vis"
    },
    NeNemNir: {
        Id: 12,
        NominativeCase: "Ne",
        AccusativeCase: "Nem",
        ReflexivePronoun: "Nemself",
        IndependentGenitiveCase: "Nirs"
    },
    PerPerPers: {
        Id: 13,
        NominativeCase: "Per",
        AccusativeCase: "Pers",
        ReflexivePronoun: "Perself",
        IndependentGenitiveCase: "Pers"
    },
    Other: {
        Id: -1,
        NominativeCase: "Other",
        AccusativeCase: "Other"
    },
    Ask: {
        Id: -2,
        NominativeCase: "Ask",
        AccusativeCase: "Ask"
    },
    Avoid: {
        Id: -3,
        NominativeCase: "Avoid",
        AccusativeCase: "Avoid"
    }
}

export const Cases = {
    NominativeCase: 0,
    AccusativeCase: 1,
    ReflexivePronoun: 2,
    IndependentGenitiveCase: 3,
    DependentGenitiveCase: 4
}