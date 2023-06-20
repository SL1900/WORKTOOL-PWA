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
		nsi?: string,
		pr?: string,
		unit: string,
		id: string,
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
				[string]: number
			}
		}
	}

	interface SideBarItem{
		text: string,
		callback: Function
	}
}
