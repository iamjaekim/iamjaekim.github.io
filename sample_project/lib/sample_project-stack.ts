import { CfnOutput, CfnOutputProps, Stack, StackProps, aws_ec2 as ec2 } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class SampleProjectStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    /**
     * Define vpc properties with ec2.VpcProps type to
     * safe guard the data passing to VPC construct
     */
    const vpc_properties: ec2.VpcProps = {
      vpcName: 'Sample-Project-DefaultVPC'
    }

    /**
     * Creating New VPC with defined properties
     */
    const sample_project_vpc = new ec2.Vpc(this, 'sampleprojectvpc', vpc_properties)

    /**
     * Define cloudfomration export property object 
     */
    const export_vpc_id: CfnOutputProps = {
      exportName: 'sample-project-vpc-id',
      value: sample_project_vpc.vpcId
    }
    /**
     * Create Cloudformation output 
     */
    new CfnOutput(this, 'export-vpc-id', export_vpc_id)
  }
}
