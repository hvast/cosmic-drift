import * as THREE from 'three';

/**
 * Camera controller for smooth zoom and pan interactions
 */
export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private targetPosition: THREE.Vector3;
  private targetLookAt: THREE.Vector3;
  private currentLookAt: THREE.Vector3;
  private isDragging: boolean = false;
  private isPanning: boolean = false;
  private previousMousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private minDistance: number = 10;
  private maxDistance: number = 100;
  private smoothFactor: number = 0.1;
  private sphericalCoords: { radius: number; theta: number; phi: number };

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.targetPosition = camera.position.clone();
    this.targetLookAt = new THREE.Vector3(0, 0, 0);
    this.currentLookAt = new THREE.Vector3(0, 0, 0);
    
    // 初始化球坐标系（用于旋转）
    const offset = new THREE.Vector3().subVectors(camera.position, this.targetLookAt);
    this.sphericalCoords = {
      radius: offset.length(),
      theta: Math.atan2(offset.x, offset.z),
      phi: Math.acos(Math.max(-1, Math.min(1, offset.y / offset.length())))
    };
  }

  /**
   * Update target position from spherical coordinates
   */
  private updateTargetPositionFromSpherical(): void {
    const offset = new THREE.Vector3();
    offset.x = this.sphericalCoords.radius * Math.sin(this.sphericalCoords.phi) * Math.sin(this.sphericalCoords.theta);
    offset.y = this.sphericalCoords.radius * Math.cos(this.sphericalCoords.phi);
    offset.z = this.sphericalCoords.radius * Math.sin(this.sphericalCoords.phi) * Math.cos(this.sphericalCoords.theta);
    
    this.targetPosition.copy(this.targetLookAt).add(offset);
  }

  /**
   * Handle mouse wheel for zoom
   */
  handleWheel(event: WheelEvent): void {
    event.preventDefault();

    const zoomSpeed = 0.002;
    const delta = event.deltaY;
    
    // 更新球坐标半径（缩放）
    const newRadius = this.sphericalCoords.radius + delta * zoomSpeed * this.sphericalCoords.radius;
    
    // 限制缩放范围
    this.sphericalCoords.radius = Math.max(this.minDistance, Math.min(this.maxDistance, newRadius));
    
    // 根据球坐标更新目标位置
    this.updateTargetPositionFromSpherical();
  }

  /**
   * Handle mouse down for drag start
   */
  handleMouseDown(event: MouseEvent): void {
    this.previousMousePosition = { x: event.clientX, y: event.clientY };
    
    if (event.button === 0) { // 左键 - 旋转
      this.isDragging = true;
    } else if (event.button === 1 || event.button === 2) { // 中键或右键 - 平移（抓手）
      this.isPanning = true;
      event.preventDefault(); // 阻止右键菜单
    }
  }

  /**
   * Handle mouse move for rotation and panning
   */
  handleMouseMove(event: MouseEvent, _containerWidth: number, _containerHeight: number): void {
    if (!this.isDragging && !this.isPanning) return;

    const deltaX = event.clientX - this.previousMousePosition.x;
    const deltaY = event.clientY - this.previousMousePosition.y;

    if (this.isDragging) {
      // 左键拖动 - 旋转视角
      const rotateSpeed = 0.005;
      
      this.sphericalCoords.theta -= deltaX * rotateSpeed;
      this.sphericalCoords.phi -= deltaY * rotateSpeed;
      
      // 限制垂直旋转角度，避免翻转
      this.sphericalCoords.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.sphericalCoords.phi));
      
      // 根据球坐标更新目标位置
      this.updateTargetPositionFromSpherical();
    } else if (this.isPanning) {
      // 右键或中键拖动 - 平移（抓手）
      const distance = this.camera.position.distanceTo(this.targetLookAt);
      const panSpeed = distance * 0.001;

      // 获取相机的右向量和上向量
      const right = new THREE.Vector3();
      const up = new THREE.Vector3();
      
      right.setFromMatrixColumn(this.camera.matrix, 0);
      up.setFromMatrixColumn(this.camera.matrix, 1);

      // 应用平移
      const panOffset = new THREE.Vector3();
      panOffset.add(right.multiplyScalar(-deltaX * panSpeed));
      panOffset.add(up.multiplyScalar(deltaY * panSpeed));

      this.targetPosition.add(panOffset);
      this.targetLookAt.add(panOffset);
    }

    this.previousMousePosition = { x: event.clientX, y: event.clientY };
  }

  /**
   * Handle mouse up for drag end
   */
  handleMouseUp(): void {
    this.isDragging = false;
    this.isPanning = false;
  }

  /**
   * Smoothly transition to look at a specific point
   */
  focusOn(position: THREE.Vector3, distance: number = 15): void {
    const direction = new THREE.Vector3();
    direction.subVectors(this.camera.position, this.currentLookAt).normalize();
    
    this.targetLookAt.copy(position);
    this.targetPosition.copy(position).add(direction.multiplyScalar(distance));
    
    // 更新球坐标以匹配新位置
    const offset = new THREE.Vector3().subVectors(this.targetPosition, this.targetLookAt);
    this.sphericalCoords.radius = offset.length();
    this.sphericalCoords.theta = Math.atan2(offset.x, offset.z);
    this.sphericalCoords.phi = Math.acos(Math.max(-1, Math.min(1, offset.y / offset.length())));
  }

  /**
   * Reset camera to default position
   */
  reset(): void {
    this.targetPosition.set(0, 20, 50);
    this.targetLookAt.set(0, 0, 0);
    
    // 更新球坐标以匹配重置位置
    const offset = new THREE.Vector3().subVectors(this.targetPosition, this.targetLookAt);
    this.sphericalCoords.radius = offset.length();
    this.sphericalCoords.theta = Math.atan2(offset.x, offset.z);
    this.sphericalCoords.phi = Math.acos(Math.max(-1, Math.min(1, offset.y / offset.length())));
  }

  /**
   * Update camera position with smooth interpolation
   */
  update(): void {
    // Smooth camera position
    this.camera.position.lerp(this.targetPosition, this.smoothFactor);
    
    // Smooth look-at target
    this.currentLookAt.lerp(this.targetLookAt, this.smoothFactor);
    this.camera.lookAt(this.currentLookAt);
  }

  /**
   * Get current drag state
   */
  getIsDragging(): boolean {
    return this.isDragging || this.isPanning;
  }
}

/**
 * Setup camera controls on a container element
 */
export function setupCameraControls(
  container: HTMLElement,
  camera: THREE.PerspectiveCamera
): CameraController {
  const controller = new CameraController(camera);

  const handleWheel = (e: WheelEvent) => controller.handleWheel(e);
  const handleMouseDown = (e: MouseEvent) => controller.handleMouseDown(e);
  const handleMouseMove = (e: MouseEvent) =>
    controller.handleMouseMove(e, container.clientWidth, container.clientHeight);
  const handleMouseUp = () => controller.handleMouseUp();
  const handleContextMenu = (e: MouseEvent) => e.preventDefault(); // 阻止右键菜单

  container.addEventListener('wheel', handleWheel, { passive: false });
  container.addEventListener('mousedown', handleMouseDown);
  container.addEventListener('mousemove', handleMouseMove);
  container.addEventListener('mouseup', handleMouseUp);
  container.addEventListener('mouseleave', handleMouseUp);
  container.addEventListener('contextmenu', handleContextMenu); // 阻止右键菜单

  // Return controller with cleanup function
  return controller;
}
