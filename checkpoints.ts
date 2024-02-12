import axios from 'axios';
import { BASE_URL, AUTH } from './consts';

(async () => {

    const { data: checkpoints } = await axios({
        method: 'get',
        url: BASE_URL('resources'),
        headers: {
            'Content-type': 'application/json'
        },
        params: {
            type: 'Checkpoint'
        },
        auth: AUTH
    });

    for (const { baseModel, fullFileName } of checkpoints) {
        console.log(baseModel, '|', fullFileName);
    }

})();
