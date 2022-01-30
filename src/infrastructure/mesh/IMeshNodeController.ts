import { MeshNodeProcess, MeshNodeProcessData } from "./MeshNodeProcess";

export interface IMeshNodeController {
    register(description: MeshNodeProcessData | MeshNodeProcess): Promise<MeshNodeProcess>
}
