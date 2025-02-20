type onboardingSwiperDataType={
    id:number;
    title:string;
    description:string;
    sortDescription:string;
    image:any;

} 
type Avatar = {
    public_id: string;
    url: string;
  };
  
  type User = {
    _id: string;
    name: string;
    email: string;
    avatar?: Avatar;
    password?: string;
    courses: any;
    createdAt: Date;
    updatedAt: Date;
    avatar?: Avatar;
    profile_picture?: Avatar;

  };
  
  type BannerDataTypes = {
    bannerImageUrl: any;
    title:string;
  };