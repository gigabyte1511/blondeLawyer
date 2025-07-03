import { exec } from 'child_process'
import util from 'util';


export async function revokeAndDeleteClient(clientId: string){
  const execPromise = util.promisify(exec);
  const revokeCommand = `docker exec vpn ikev2.sh --revokeclient ${clientId} -y`;
  await execPromise(revokeCommand);
  
  const deleteCommand = `docker exec vpn ikev2.sh --deleteclient ${clientId} -y`;
  await execPromise(deleteCommand);
  }