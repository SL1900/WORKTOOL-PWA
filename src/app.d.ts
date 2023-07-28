// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	// interface Error {}
	// interface Locals {}
	// interface PageData {}
	// interface Platform {}

	interface ItemData{
		name: string,
		nsi: string,
		pr: string,
		unit: string,
		id: string,
		highlights:{
			name: Array<Array<number>>
			nsi: Array<Array<number>>
			pr: Array<Array<number>>
		}
		cells: {
			[string]: number
		}
	}

	interface DataFile{
		[string?]:{
			name: string,
			pr: string,
			nsi: string,
			unit: string,
			cells:{
				[string?]: number
			}
		}
	}

	const AreaName = ["П01","П02","П03","П04"] as const;

	type AreasType = {
		[name in typeof AreaName[number]]: {
			name: string,
			key: AreaName,
			items: {name: string, amount: number}[]
		}
	}

	interface SideBarItem{
		text: string,
		callback: Function
	}

	interface MapPolygon{
		coords: number[][],
		label_align: "left" | "right" | "center" | "top" | "bottom"
		name: string
	}

	interface MapDescriptor{
		key: string,
		items: MapPolygon[]
	}

	interface SearchTerm{
		text: string,
		exclude: boolean
	}

	interface FeedbackData{
        [key: string]:{
            message: string,
			id: string,
			author_ip: string,
			timestamp: number
        }
    };
}
