type Descriptors = {
    [name in typeof App.AreaName[number]]: App.MapDescriptor
}

export let descriptors: Descriptors = {
    "П01":{
        key: "П01",
        items: [
            {
                name: "A-01",
                label_align: "right",
                coords: [
                    [0,250],
                    [50,250],
                    [50,410],
                    [0,410]
                ]
            },
            {
                name: "R1S2",
                label_align: "center",
                coords: [
                    [0,250],
                    [50,250],
                    [50,230],
                    [0,230]
                ]
            },
            {
                name: "R1S3",
                label_align: "center",
                coords: [
                    [0,230],
                    [50,230],
                    [50,210],
                    [0,210]
                ]
            },
            {
                name: "R1S4",
                label_align: "center",
                coords: [
                    [0,210],
                    [50,210],
                    [50,190],
                    [0,190]
                ]
            },
            {
                name: "R5S1",
                label_align: "left",
                coords: [
                    [210,250],
                    [250,250],
                    [250,410],
                    [210,410]
                ]
            },
        ]
    },
    "П02":{
        key: "П02",
        items: []
    },
    "П03":{
        key: "П03",
        items: []
    },
    "П04":{
        key: "П04",
        items: []
    }
}