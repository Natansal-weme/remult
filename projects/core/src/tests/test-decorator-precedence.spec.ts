
import { Remult } from '../context';
import { Field, Entity, EntityBase, FindOptions, Repository, Fields } from '../remult3';

@Entity('my entity')
class myEntity extends EntityBase {

    @Fields.String()
    @Fields.String({ caption: '123' })
    a: string;

    @Fields.String({ caption: '123' })
    @Fields.String()
    b: string;
    @Fields.String((o, c) => o.caption = "456")
    c: string;

}

describe("test decorator precedence", () => {



    it("test basics", async () => {
        let c = new Remult();
        let r = c.repo(myEntity);
        expect([...r.metadata.fields].length).toBe(3);
        expect(r.metadata.fields.a.caption).toBe('123');
        expect(r.metadata.fields.b.caption).toBe('123');
        expect(r.metadata.fields.c.caption).toBe('456');
    });
    it("testit", () => {
        let c = new Remult();
        let r = c.repo(user).create();
        expect(r.$.username.metadata.caption).toBe("Username");
    })


});

@Entity('profile')
class profile extends EntityBase {
    @Fields.String()
    username: string;
}
@Entity('user')
class user extends profile {
    @Fields.String()
    email: string;
}