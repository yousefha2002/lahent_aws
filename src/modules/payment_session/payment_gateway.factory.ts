import { GatewayType } from "src/common/enums/gatewat_type";
import { PaymentGateway } from "./interfaces/payment_session.interface";
import { EdFapayGateway } from "./gateways/edfapay.gateway";

export class PaymentGatewayFactory {
    static getProvider(name: string): PaymentGateway {
        switch (name) {
        case GatewayType.edfapay:
            return new EdFapayGateway();
        default:
            throw new Error('Unsupported payment provider');
        }
    }
}
