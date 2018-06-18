import {Entity, Column, BeforeInsert, PrimaryColumn} from "typeorm";
import * as uuid from 'uuid/v4';

@Entity()
export class User  {

    @PrimaryColumn("uuid")
    id: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @BeforeInsert()
    setId() {
        this.id = uuid()
    }

}
