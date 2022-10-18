import constants from './constants';
import { Decimals18 } from './functions';

export default {
    validDuration: 5 * 60,
    periods: [30, 90, 365],
    minFunding: Decimals18(constants._1k),
};

// export default {};
