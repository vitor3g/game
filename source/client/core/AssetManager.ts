import {
  AudioLoader,
  FileLoader,
  LoadingManager,
  ObjectLoader,
  TextureLoader,
  type Material,
} from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
export enum AssetType {
  MODEL_GLTF = 'model/gltf',
  MODEL_FBX = 'model/fbx',
  MODEL_JSON = 'model/json',
  TEXTURE = 'texture',
  AUDIO = 'audio',
  JSON = 'json',
  TEXT = 'text',
}

export interface AssetMetadata {
  type: AssetType;
  url: string;
  key: string;
  loaded: boolean;
  data?: any;
  dependencies?: string[];
}

export interface AssetGroup {
  name: string;
  assets: string[];
  onComplete?: () => void;
}

export class AssetManager {
  private assets = new Map<string, AssetMetadata>();
  private groups = new Map<string, AssetGroup>();
  private loadingManager: LoadingManager;

  private gltfLoader: GLTFLoader;
  private fbxLoader: FBXLoader;
  private textureLoader: TextureLoader;
  private audioLoader: AudioLoader;
  private objectLoader: ObjectLoader;
  private fileLoader: FileLoader;

  private totalAssets = 0;
  private loadedAssets = 0;
  private isLoadingQueue = false;
  private pendingLoads = 0;

  constructor() {

    this.loadingManager = new LoadingManager();
    this.configureLoadingManager();

    this.gltfLoader = new GLTFLoader(this.loadingManager);
    this.fbxLoader = new FBXLoader(this.loadingManager);
    this.textureLoader = new TextureLoader(this.loadingManager);
    this.audioLoader = new AudioLoader(this.loadingManager);
    this.objectLoader = new ObjectLoader(this.loadingManager);
    this.fileLoader = new FileLoader(this.loadingManager);

    console.log('Asset Manager initialized');
  }

  private configureLoadingManager(): void {
    this.loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
     console.log(
        `Started loading: ${url}. ${itemsLoaded}/${itemsTotal} items loaded`,
      );
    };

    this.loadingManager.onLoad = () => {
      console.log('Loading complete!');
    };

    this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const percentage = Math.round((itemsLoaded / itemsTotal) * 100);
      console.log(`Loading: ${percentage}% (${url})`);

      g_core.getInternalNet().emit('asset.progress', {
        url,
        loaded: itemsLoaded,
        total: itemsTotal,
        percentage,
      });
    };

    this.loadingManager.onError = (url) => {
      console.log(`Error loading: ${url}`);

      g_core.getInternalNet().emit('asset.error', { url });
    };
  }

  public register(
    key: string,
    url: string,
    type: AssetType,
    dependencies: string[] = [],
  ): void {
    if (this.assets.has(key)) {
      console.log(`Asset already registered with key: ${key}`);
      return;
    }

    this.assets.set(key, {
      key,
      url,
      type,
      loaded: false,
      dependencies,
    });

    this.totalAssets++;
    console.log(`Registered asset: ${key} (${url})`);
  }

  public createGroup(
    name: string,
    assets: string[],
    onComplete?: () => void,
  ): void {
    if (this.groups.has(name)) {
      console.log(`Group already exists: ${name}`);
      return;
    }

    this.groups.set(name, {
      name,
      assets,
      onComplete,
    });

    console.log(
      `Created asset group: ${name} with ${assets.length} assets`,
    );
  }

  public async load(key: string): Promise<any> {
    const asset = this.assets.get(key);

    if (!asset) {
      console.error(`Asset not found: ${key}`);
      return Promise.reject(new Error(`Asset not found: ${key}`));
    }

    if (asset.loaded && asset.data) {
      console.log(`Asset already loaded: ${key}`);
      return Promise.resolve(asset.data);
    }

    if (asset.dependencies && asset.dependencies.length > 0) {
      for (const dep of asset.dependencies) {
        await this.load(dep);
      }
    }

    this.isLoadingQueue = true;
    this.pendingLoads++;

    return new Promise((resolve, reject) => {
      try {
        switch (asset.type) {
          case AssetType.MODEL_GLTF:
            this.gltfLoader.load(asset.url, (gltf) => {
              gltf.scene.traverse((child: any) => {
                if (child.isMesh) {
                  const mesh = child;
                  const materials = Array.isArray(mesh.material)
                    ? mesh.material
                    : [mesh.material];

                  materials.forEach((material: Material) => {
                    material.transparent = false;
                    material.depthWrite = true;
                    material.depthTest = true;
                    material.alphaTest = 0.01;
                    material.needsUpdate = true;
                  });
                }
              });
              this.handleAssetLoaded(key, gltf, resolve);
            });
            break;

          case AssetType.MODEL_FBX:
            this.fbxLoader.load(asset.url, (fbx) =>
              this.handleAssetLoaded(key, fbx, resolve),
            );
            break;

          case AssetType.MODEL_JSON:
            this.objectLoader.load(asset.url, (obj) =>
              this.handleAssetLoaded(key, obj, resolve),
            );
            break;

          case AssetType.TEXTURE:
            this.textureLoader.load(asset.url, (texture) =>
              this.handleAssetLoaded(key, texture, resolve),
            );
            break;

          case AssetType.AUDIO:
            this.audioLoader.load(asset.url, (buffer) =>
              this.handleAssetLoaded(key, buffer, resolve),
            );
            break;

          case AssetType.JSON:
            this.fileLoader.setResponseType('json');
            this.fileLoader.load(asset.url, (json) =>
              this.handleAssetLoaded(key, json, resolve),
            );
            break;

          case AssetType.TEXT:
            this.fileLoader.setResponseType('text');
            this.fileLoader.load(asset.url, (text) =>
              this.handleAssetLoaded(key, text, resolve),
            );
            break;

          default:
            this.pendingLoads--;
            this.checkAllLoaded();
            reject(new Error(`Unsupported asset type: ${asset.type}`));
        }
      } catch (error) {
        this.pendingLoads--;
        this.checkAllLoaded();
        console.error(`Error loading asset ${key}: ${error}`);
        reject(error);
      }
    });
  }

  private handleAssetLoaded(
    key: string,
    data: any,
    resolve: (value: any) => void,
  ): void {
    const asset = this.assets.get(key);
    if (asset) {
      asset.loaded = true;
      asset.data = data;
      this.loadedAssets++;

      console.log(`Asset loaded: ${key}`);

      g_core.getInternalNet().emit('asset.loaded', { key, data });

      this.pendingLoads--;
      this.checkAllLoaded();

      resolve(data);
    }
  }

  private checkAllLoaded(): void {
    if (this.isLoadingQueue && this.pendingLoads === 0) {
      this.isLoadingQueue = false;

      g_core.getInternalNet().emit('asset.all.loaded', {
        totalAssets: this.totalAssets,
        loadedAssets: this.loadedAssets,
        progress: this.getLoadingProgress(),
      });

      console.log('All pending assets loaded completely!');
    }
  }

  public async loadGroup(groupName: string): Promise<Map<string, any>> {
    const group = this.groups.get(groupName);

    if (!group) {
      console.error(`Group not found: ${groupName}`);
      return Promise.reject(new Error(`Group not found: ${groupName}`));
    }

    console.log(`Loading asset group: ${groupName}`);

    g_core.getInternalNet().emit('asset.group.start', {
      group: groupName,
      total: group.assets.length,
    });

    const results = new Map<string, any>();
    let loaded = 0;

    this.isLoadingQueue = true;

    try {
      await Promise.all(
        group.assets.map(async (key) => {
          const data = await this.load(key);
          results.set(key, data);

          loaded++;

          g_core.getInternalNet().emit('asset.group.progress', {
            group: groupName,
            loaded,
            total: group.assets.length,
            percentage: Math.round((loaded / group.assets.length) * 100),
          });
        }),
      );

      console.log(`Group loaded: ${groupName}`);

      if (group.onComplete) {
        group.onComplete();
      }

      g_core.getInternalNet().emit('asset.group.complete', {
        group: groupName,
        results,
      });

      return results;
    } catch (error) {
      console.error(`Error loading group ${groupName}: ${error}`);

      g_core.getInternalNet().emit('asset.group.error', {
        group: groupName,
        error,
      });

      throw error;
    }
  }

  public get<T>(key: string): T | null {
    const asset = this.assets.get(key);

    if (!asset?.loaded) {
      console.log(`Attempted to get unloaded asset: ${key}`);
      return null;
    }

    return asset.data as T;
  }

  public unload(key: string): boolean {
    const asset = this.assets.get(key);

    if (!asset) {
      return false;
    }

    if (asset.loaded && asset.data) {
      if (asset.type === AssetType.TEXTURE && asset.data.dispose) {
        asset.data.dispose();
      }

      asset.loaded = false;
      asset.data = undefined;
      this.loadedAssets--;

      console.log(`Asset unloaded: ${key}`);
      return true;
    }

    return false;
  }

  public unloadAll(groupName?: string): void {
    if (groupName) {
      const group = this.groups.get(groupName);

      if (!group) {
        console.log(`Group not found for unloading: ${groupName}`);
        return;
      }

      group.assets.forEach((key) => this.unload(key));
      console.log(`Group unloaded: ${groupName}`);
    } else {
      this.assets.forEach((_asset, key) => {
        this.unload(key);
      });

      console.log('All assets unloaded');
    }
  }

  public getLoadingProgress(): number {
    if (this.totalAssets === 0) return 100;
    return Math.round((this.loadedAssets / this.totalAssets) * 100);
  }

  public areAllAssetsLoaded(): boolean {
    return (
      !this.isLoadingQueue &&
      this.pendingLoads === 0 &&
      this.loadedAssets === this.totalAssets
    );
  }

  public waitForAllAssetsLoaded(): Promise<void> {
    if (this.areAllAssetsLoaded()) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const handler = () => {
        resolve();
      };

      g_core.getInternalNet().on('asset.all.loaded', handler);
    });
  }

  public preloadCriticalAssets(): Promise<void> {
    console.log('Preloading critical assets...');

    const criticalAssets: any[] = [
      // "car_main", "ui_elements", "engine_sound"
    ];

    return new Promise((resolve) => {
      if (criticalAssets.length === 0) {
        console.log('No critical assets defined');
        resolve();
        return;
      }

      Promise.all(criticalAssets.map((key) => this.load(key)))
        .then(() => {
          console.log('Critical assets preloaded');
          resolve();
        })
        .catch((error) => {
          console.error(`Error preloading critical assets: ${error}`);
          resolve();
        });
    });
  }
}
