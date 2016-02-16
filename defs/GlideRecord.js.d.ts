declare class GlideRecord {

    save(filename: string): void;

    constructor(table:string);

    addQuery(field:string, value:string, operator?:string);

    get(id:string);

    setValue(field:string, value:any);

    getValue(field:string):string;

    initialize();

    insert();

    update();

    getUniqueValue():string;

    getRowCount():number;

    hasNext():boolean;

    next();

    query();
}