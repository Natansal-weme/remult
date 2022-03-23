import { ClassType } from '../../classType';
import { Remult } from '../context';
import { Field, Entity, EntityBase, Repository, Fields } from '../remult3';


export var testConfiguration = { restDbRunningOnServer: false };
@Entity<entityWithValidations>('', {
    allowApiCrud: true,
    saving: async (t) => {
        if (!t.name || t.name.length < 3)
            t._.fields.name.error = 'invalid';

        if (t._.isNew() && (!t.myId || t.myId == 0)) {
            let e = await t.remult.repo(entityWithValidations).find({
                orderBy: { myId: "desc" },
                limit: 1
            });

            t.myId = e.length ? e[0].myId + 1 : 1;

        }
        if (!testConfiguration.restDbRunningOnServer)
            entityWithValidations.savingRowCount++;

    }
})
export class entityWithValidations extends EntityBase {
    @Fields.Integer()
    myId: number;
    @Fields.String()
    name: string;
    static savingRowCount = 0;
    constructor(private remult: Remult) {
        super();
    }

    static async create4RowsInDp(createEntity: (entity: ClassType<any>) => Promise<Repository<entityWithValidations>>) {
        let s = await createEntity(entityWithValidations);
        let c = s.create();
        c.myId = 1;
        c.name = 'noam';
        await c._.save();
        c = s.create();
        c.myId = 2;
        c.name = 'yael';
        await c._.save();
        c = s.create();
        c.myId = 3;
        c.name = 'yoni';
        await c._.save();
        c = s.create();
        c.myId = 4;
        c.name = 'maayan';
        await c._.save();
        return s;
    }
}

