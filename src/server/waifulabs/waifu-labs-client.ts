import { WaifuLabsSocket } from './waifu-labs-socket';
import {
  GenerateBigResponse,
  GenerateGridResponse,
  GenerateWaifuStep,
  Waifu,
  WaifuLabsSocketEvent,
  WaifuSeedable
} from './waifulabs';

export class WaifuLabsClient {
  private waifuLabsSocket: WaifuLabsSocket;

  constructor(waifuLabsSocket: WaifuLabsSocket) {
    this.waifuLabsSocket = waifuLabsSocket;
  }

  private static waifuLabsClientSingleton: WaifuLabsClient;

  public static async getWaifuLabsClient(): Promise<WaifuLabsClient> {
    if (!WaifuLabsClient.waifuLabsClientSingleton) {
      const waifuLabsSocket = await WaifuLabsSocket.getWaifuLabsSocket();
      WaifuLabsClient.waifuLabsClientSingleton = new WaifuLabsClient(waifuLabsSocket);
    }
    return WaifuLabsClient.waifuLabsClientSingleton;
  }

  async getWaifus(step = GenerateWaifuStep.BASE, waifu?: WaifuSeedable): Promise<Waifu[]> {
    const currentGirl = typeof waifu === 'string' ? waifu : waifu?.seeds;
    const response = currentGirl
      ? await this.waifuLabsSocket.request<GenerateGridResponse>(WaifuLabsSocketEvent.GENERATE, { id: 1, params: { step, currentGirl } })
      : await this.waifuLabsSocket.request<GenerateGridResponse>(WaifuLabsSocketEvent.GENERATE, { id: 1, params: { step } });

    return response.response.data.newGirls;
  }

  async getWaifuPortrait(waifu: WaifuSeedable, size = 512): Promise<Waifu> {
    const currentGirl = typeof waifu === 'string' ? waifu : waifu.seeds;
    const response = await this.waifuLabsSocket.request<GenerateBigResponse>(WaifuLabsSocketEvent.GENERATE_PORTRAIT, { params: { currentGirl, size } });
    return {
      image: response.response.data.girl,
      seeds: currentGirl,
    };
  }

  // async save(waifu: WaifuSeedable, name: string): Promise<AxiosResponse> {
  //   const seeds = typeof waifu === 'string' ? waifu : waifu.seeds;
  //   const response = await WaifuLabsAxios.post('/generate/save_unauth', {
  //     girlName: name,
  //     seeds,
  //     _csrf_token: this.waifuLabsSocket.csrf,
  //   });
  //   return response;
  // }

}
