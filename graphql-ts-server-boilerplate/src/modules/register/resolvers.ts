
import * as bcrypt from 'bcryptjs';
import { User } from '../../entity/User';
import { ResolverMap } from '../../types/graphql-utils';

export const resolvers : ResolverMap = {
    
    Mutation :{
        register: async (_, {email, password} : GQL.IRegisterOnMutationArguments) => {
           const hashpassword = await bcrypt.hash(password, 10);
           const user = User.create({
               email, password: hashpassword
           });
           user.save();
           return true;
        }
    }
  }